/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

precision highp float;

uniform sampler2D canvasBack1;
uniform sampler2D canvasBack2;
varying vec2 fragCoord;
uniform float fade;
uniform float page;

void main () {
  vec4 colour1 = texture2D(canvasBack1, fragCoord);
  vec4 colour2 = texture2D(canvasBack2, fragCoord);

  gl_FragColor = ((1.0 - fade) * colour1) + (fade * colour2);
  gl_FragColor.a = 1.0;
}
