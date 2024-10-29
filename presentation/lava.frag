precision highp float;

#define M_PI 3.1415926535897932384626433832795

uniform sampler2D canvasBack1;
uniform sampler2D canvasBack2;
varying vec2 fragCoord;
uniform float fade;
uniform float page;

float cosnorm(const float theta) {
  return (1.0 - cos(theta * 2.0 * M_PI)) / 2.0;
}

void main () {
  const float paleness = 0.7;
  const float colourshift = 2.0;

  vec4 colour1 = texture2D(canvasBack1, fragCoord);
  vec4 colour2 = texture2D(canvasBack2, fragCoord);

  float movement = (fade / 8.0) + (page * 11.3);
  float colourfade = min(fade * 10.0, 1.0);

  float red = paleness + (1.0 - paleness) * cosnorm((movement * colourshift));
  float green = paleness + (1.0 - paleness) * cosnorm((movement * colourshift) + (1.0 / 3.0));
  float blue = paleness + (1.0 - paleness) * cosnorm((movement * colourshift) + (2.0 / 3.0));

  float stickiness = cosnorm(fade * 0.1);
  float stickiness_low = min(cosnorm((fade - 0.1) * 0.1), stickiness - 0.0005);
  float r1 = 0.15 + pow(fade, 2.0);
  const float r2 = 0.15;
  const float r3 = 0.15;
  const vec2 ratio = vec2(840.0, 360.0) / 840.0;
  vec2 pos1 = vec2(cosnorm(16.0 * movement / 9.000), cosnorm(16.0 * movement / 7.1000)) * ratio;
  vec2 pos2 = vec2(cosnorm(16.0 * movement / 8.900), cosnorm(16.0 * movement / 10.400)) * ratio;
  vec2 pos3 = vec2(cosnorm(16.0 * movement / 9.650), cosnorm(16.0 * movement / 91.500)) * ratio;
  vec2 pos = fragCoord * ratio;
  
  float d1 = pow((pos.x - pos1.x), 2.0) + pow((pos.y - pos1.y), 2.0) - pow(r1, 2.0);
  float d2 = pow((pos.x - pos2.x), 2.0) + pow((pos.y - pos2.y), 2.0) - pow(r2, 2.0);
  float d3 = pow((pos.x - pos3.x), 2.0) + pow((pos.y - pos3.y), 2.0) - pow(r3, 2.0);
  
  float distance = d1 * d2 * d3;
  vec4 colour = colour1;
  
  if (distance < stickiness) {
    if (distance > (stickiness_low)) {
  	  colour = mix(colour1, vec4(red, green, blue, 1.0), colourfade);
    }
    else {
  	  colour = mix(colour1, colour2, colourfade);
    }
  }
  
  gl_FragColor = colour;
}
