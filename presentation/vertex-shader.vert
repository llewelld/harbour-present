/* vim: set et ts=2 sts=2 sw=2: */
/* SPDX-License-Identifier: BSD-2-Clause */
/* Copyright © 2024 David Llewellyn-Jones */

precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 fragCoord;

void main(void) {
  fragCoord = aTextureCoord;
  gl_Position = vec4(aVertexPosition, 1.0);
}
