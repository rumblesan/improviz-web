import { dedent } from 'dentist';

import { createBuffers } from './buffers';

export const vertCode = dedent(`
  attribute vec3 position;
  uniform mat4 Pmatrix;
  uniform mat4 Vmatrix;
  uniform mat4 Mmatrix;
  uniform vec4 Color;
  varying vec4 vColor;
  void main(void) { 
    gl_Position = ((Pmatrix * Vmatrix) * Mmatrix) * vec4(position, 1.);
    vColor = Color;
  }
`);

export const fragCode = dedent(`
  precision mediump float;
  varying vec4 vColor;
  void main(void) {
    gl_FragColor = vColor;
  }
`);

export function compileProgram(gl, vc, fc) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vc);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fc);
  gl.compileShader(fragShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  return program;
}

export function makeShape(gl, program, geometry) {
  const buffers = createBuffers(gl, geometry);

  var Pmatrix = gl.getUniformLocation(program, 'Pmatrix');
  var Vmatrix = gl.getUniformLocation(program, 'Vmatrix');
  var Mmatrix = gl.getUniformLocation(program, 'Mmatrix');
  var Color = gl.getUniformLocation(program, 'Color');

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
  var position = gl.getAttribLocation(program, 'position');
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position);

  gl.useProgram(program);

  return {
    program,
    buffers,
    uniforms: {
      Pmatrix,
      Vmatrix,
      Mmatrix,
      Color,
    },
    geometry,
  };
}
