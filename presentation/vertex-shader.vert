precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 fragCoord;

void main(void) {
  fragCoord = aTextureCoord;
  gl_Position = vec4(aVertexPosition, 1.0);
}
