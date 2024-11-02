/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

// The filename of the presentation PDF
var url = 'presentation.pdf';
var { pdfjsLib } = globalThis;
var pdf;
var scale = 1.0;
var canvasFront;
var canvasBack = [];
var gl;
var contextBack = [];
var pageNumber = 1;
var shaderProgram;
var shaderImmediateProgram;
var squareVertexPositionBuffer;
var squareVertexTextureCoordBuffer;
var slideChangeTime;
var tex1;
var tex2;
var tex3;
var rendering = false;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

// Vertex shader code
var vsCode = "\n"
  + "  precision highp float;\n"
  + "\n"
  + "  attribute vec3 aVertexPosition;\n"
  + "  attribute vec2 aTextureCoord;\n"
  + "\n"
  + "  varying vec2 fragCoord;\n"
  + "\n"
  + "  void main(void) {\n"
  + "    fragCoord = aTextureCoord;\n"
  + "    gl_Position = vec4(aVertexPosition, 1.0);\n"
  + "  }\n"
  + "\n";

// Fragment shader
var fsCode = "\n"
  + "  precision highp float;\n"
  + "\n"
  + "  uniform sampler2D canvasBack1;\n"
  + "  uniform sampler2D canvasBack2;\n"
  + "  varying vec2 fragCoord;\n"
  + "  uniform float fade;\n"
  + "  uniform float page;\n"
  + "\n"
  + "  void main () {\n"
  + "    vec4 colour1 = texture2D(canvasBack1, fragCoord);\n"
  + "    vec4 colour2 = texture2D(canvasBack2, fragCoord);\n"
  + "\n"
  + "    gl_FragColor = ((1.0 - fade) * colour1) + (fade * colour2);\n"
  + "    gl_FragColor.a = 1.0;\n"
  + "  }\n"
  + "\n";

// Vertex shader code for immediate rendering
var vsCodeImmediate = "\n"
  + "  precision highp float;\n"
  + "\n"
  + "  attribute vec3 aVertexPosition;\n"
  + "  attribute vec2 aTextureCoord;\n"
  + "\n"
  + "  varying vec2 fragCoord;\n"
  + "\n"
  + "  void main(void) {\n"
  + "    fragCoord = aTextureCoord;\n"
  + "    gl_Position = vec4(aVertexPosition, 1.0);\n"
  + "  }\n"
  + "\n";

// Fragment shader for immediate rendering
var fsCodeImmediate = "\n"
  + "  precision highp float;\n"
  + "\n"
  + "  uniform sampler2D canvasBack2;\n"
  + "  varying vec2 fragCoord;\n"
  + "\n"
  + "  void main () {\n"
  + "    vec4 colour2 = texture2D(canvasBack2, fragCoord);\n"
  + "\n"
  + "    gl_FragColor = colour2;\n"
  + "  }\n"
  + "\n";

// GET a file
function request(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = resolve;
    xhr.onerror = reject;
    xhr.send();
  });
}

// Compile the shader with the given text
// Type should be either gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
function compileShader(str, type) {
  var shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error: " + gl.getShaderInfoLog(shader));
    shader = null;
  }

  return shader;
}

// Compile the shader program using the given vertex and fragment shaders
function compileProgram(vertex, fragment) {
  var fragmentShader = compileShader(fragment, gl.FRAGMENT_SHADER);
  var vertexShader = compileShader(vertex, gl.VERTEX_SHADER);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Could not initialise shaders");
  }

  return shaderProgram;
}

// Create a texture to represent the back buffer canvas
function createTexture(canvasBack, textureNum, shader, texVar) {
  var tex = gl.createTexture();

  updateTexture(tex, canvasBack, textureNum);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  var location = gl.getUniformLocation(shader, texVar);
  gl.uniform1i(location, textureNum);

  return tex;
}

// Update the texture from the back buffer canvas
function updateTexture(tex, canvasBack, textureNum) {
  gl.activeTexture(gl.TEXTURE0 + textureNum);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasBack);
}

// Clear the back buffer a given colour
function clearBackBuffer(buffer, colour) {
    contextBack[buffer].rect(0, 0, canvasBack[buffer].width, canvasBack[buffer].height);
    contextBack[buffer].fillStyle = colour;
    contextBack[buffer].fill();
}

// Initialise the PDF document, canvases and textures
function initialiseRenderProcess() {
  // Fetch the shaders
  request("lava.frag").then(function(e) {
    fsCode = e.target.response;
    request("vertex-shader.vert").then(function(e) {
      vsCode = e.target.response;
      // Fetch the first page
      pdf.getPage(pageNumber).then(function(page) {
        // Figure out the correct scaling of the PDF render
        scale = 1.0;
        var viewport = page.getViewport({scale: scale});
        var screenwidth = Math.max(window.screen.width, window.screen.height);
        var screenheight = Math.min(window.screen.width, window.screen.height);

        var xscale = screenwidth / viewport.width;
        var yscale = screenheight / viewport.height;
        scale = Math.min(xscale, yscale) * 4;
        viewport = page.getViewport({scale: scale});

        // Prepare the front buffer canvas using PDF page dimensions
        canvasFront = document.getElementById("canvas-front");
        gl = canvasFront.getContext("webgl2");
        canvasFront.height = viewport.height;
        canvasFront.width = viewport.width;
        gl.getExtension("OES_standard_derivatives");

        // Prepare the back buffer canvases
        var canvas;
        var context;
        canvas = document.createElement("canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        context = canvas.getContext("2d");
        canvasBack.push(canvas);
        contextBack.push(context);

        canvas = document.createElement("canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        context = canvas.getContext("2d");
        canvasBack.push(canvas);
        contextBack.push(context);

        // Compile and set up the immediage shader program
        shaderImmediateProgram = compileProgram(vsCodeImmediate, fsCodeImmediate);

        shaderImmediateProgram.vertexPositionAttribute = gl.getAttribLocation(shaderImmediateProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderImmediateProgram.vertexPositionAttribute);

        shaderImmediateProgram.textureCoordAttribute = gl.getAttribLocation(shaderImmediateProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderImmediateProgram.textureCoordAttribute);

        // Compile and set up the shader program
        shaderProgram = compileProgram(vsCode, fsCode);
        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.fade = gl.getUniformLocation(shaderProgram, "fade");
        shaderProgram.page = gl.getUniformLocation(shaderProgram, "page");

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var vertices = [
          1.0,  -1.0,  0.0,
          -1.0,  -1.0,  0.0,
          1.0, 1.0,  0.0,
          -1.0, 1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        squareVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);
        var textureCoords = [
          1.0, 1.0,
          0.0, 1.0,
          1.0, 0.0,
          0.0, 0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        squareVertexTextureCoordBuffer.itemSize = 2;
        squareVertexTextureCoordBuffer.numItems = 4;

        tex1 = createTexture(canvasBack[0], 0, shaderProgram, "canvasBack1");
        tex2 = createTexture(canvasBack[1], 1, shaderProgram, "canvasBack2");

        gl.useProgram(shaderImmediateProgram);
        tex3 = createTexture(canvasBack[1], 3, shaderImmediateProgram, "canvasBack2");
        gl.useProgram(shaderProgram);

        // Render the first page
        clearBackBuffer(0, "#ffffffff");
        renderPage(1, 1);

        // Ensure the controls are in place
        document.body.addEventListener("click", tapped);
        window.addEventListener("nextpage", handleEvent, true, false);
        window.addEventListener("prevpage", handleEvent, true, false);
      });
    }, function(e) {
      console.error("Failed to load vertex shader");
    });
  }, function(e) {
    console.error("Failed to load fragment shader");
  });
}

// Set a callback for window update events
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// Perform the transition from one slide ot the next
// To be called repeatedly to perform the animation
function transition() {
  var timeNow = new Date().valueOf() / 1000.0;
  var fade = Math.min(0.4 * (timeNow - slideChangeTime), 1.0);
  gl.uniform1f(shaderProgram.fade, fade);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, squareVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

  if (fade < 1.0) {
    requestAnimFrame(transition);
  }
}

// Perform the transition from one slide ot the next
// To be called repeatedly to perform the animation
function renderImmediate() {
  gl.useProgram(shaderImmediateProgram);
  updateTexture(tex3, canvasBack[1], 3);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderImmediateProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderImmediateProgram.textureCoordAttribute, squareVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

  gl.useProgram(shaderProgram);
}

// Kick off the transition from one page to the next
function startTransition() {
  updateTexture(tex1, canvasBack[0], 0);
  updateTexture(tex2, canvasBack[1], 1);
  slideChangeTime = new Date().valueOf() / 1000.0;
  gl.uniform1f(shaderProgram.page, pageNumber);

  transition();
}

// Render the current page and the next page, in preparation for a transition
function renderPages(currentPage, nextPage) {
  if (!rendering) {
    rendering = true;
    pdf.getPage(currentPage).then(function(page) {
      var viewport = page.getViewport({scale: scale});

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: contextBack[0],
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function () {

        pdf.getPage(nextPage).then(function(page) {
          var viewport = page.getViewport({scale: scale});

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: contextBack[1],
            viewport: viewport
          };
          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            // Finally set the transition going
            rendering = false;
            if (nextPage !== pageNumber) {
              renderPages(currentPage, pageNumber);
            }
            else {
              startTransition();
            }
          });
        });
      });
    });
  }
}

function setPageNumber(newNumber) {
  var changed = false;

  if (newNumber > pdf.numPages) {
    newNumber = pdf.numPages;
  }
  if (newNumber < 1) {
    newNumber = 1;
  }

  if (pageNumber !== newNumber) {
    pageNumber = newNumber;
    changed = true;

    // Dispatch a pagechange event
    const event = new CustomEvent("pagechange", { detail: { page: pageNumber }});
    dispatchEvent(event);
  }

  return changed;
}

// Render a single page to a back buffer
function renderPage(pageNumber, buffer) {
  pdf.getPage(pageNumber).then(function(page) {
    var viewport = page.getViewport({scale: scale});

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: contextBack[buffer],
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      // Don't perform an instant render, instead apply the shader
      //gl.drawImage(canvasBack[buffer], 0, 0);
      startTransition();
    });
  });
}

// Render a page to the front buffer immediately
function renderPageNow(renderPageNumber) {
  if (!rendering) {
    rendering = true;
    pdf.getPage(renderPageNumber).then(function(page) {
      var viewport = page.getViewport({scale: scale});

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: contextBack[1],
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        // Perform an instant render
        renderImmediate()
        rendering = false;
        if (pageNumber !== renderPageNumber) {
          renderPageNow(pageNumber);
        }
      });
    });
  }
}

// Move one page forwards in the presentation with a transition
function renderNextPage() {
  var changed = setPageNumber(pageNumber + 1);
  if (changed) {
    renderPages(pageNumber - 1, pageNumber);
  }
}

// Move one page backwards in the presentation with a transition
function renderPrevPage() {
  var changed = setPageNumber(pageNumber - 1);
  if (changed) {
    renderPages(pageNumber + 1, pageNumber);
  }
}

// Move one page forwards in the presentation immediately
function nextPageImmediate() {
  var changed = setPageNumber(pageNumber + 1);
  if (changed) {
    renderPageNow(pageNumber);
  }
}

// Move one page backwards in the presentation immediately
function prevPageImmediate() {
  var changed = setPageNumber(pageNumber - 1);
  if (changed) {
    renderPageNow(pageNumber);
  }
}

// Function to be called when the user taps the screen
function tapped(event) {
  if (event.clientX > window.screen.width / 2.0) {
    renderNextPage();
  }
  else {
    renderPrevPage();
  }
}

// Handle events coming from the front end user interface
function handleEvent(aEvent) {
  switch (aEvent.type) {
    case "nextpage": {
      nextPageImmediate();
      break;
    }
    case "prevpage": {
      prevPageImmediate();
      break;
    }
  }
}

// Initialise the page and then start rendering
function initialise() {
  // Asynchronous download of PDF
  var loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(function(pdfloaded) {
    pdf = pdfloaded;
    initialiseRenderProcess();
  }, function (reason) {
    // PDF loading error
    console.error(reason);
  });
}

// Entrypoint
addEventListener("load", (event) => {
  initialise();
});
