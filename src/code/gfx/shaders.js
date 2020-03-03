import { dedent } from 'dentist';

import { createBuffers } from './buffers';

export const vertCode = dedent(`
  attribute vec3 position;
  attribute vec3 barycentric;
  uniform mat4 Pmatrix;
  uniform mat4 Vmatrix;
  uniform mat4 Mmatrix;
  uniform vec4 Color;
  varying vec4 vColor;
  varying vec3 vbc;
  void main(void) { 
    gl_Position = ((Pmatrix * Vmatrix) * Mmatrix) * vec4(position, 1.);
    vColor = Color;
    vbc = barycentric;
  }
`);

export const fragCode = dedent(`
  precision mediump float;
  varying vec4 vColor;
  varying vec3 vbc;
  float strokeSize = 0.1;
  void main(void) {
    if(vbc.x < strokeSize || vbc.y < strokeSize || vbc.z < strokeSize) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = vColor;
    }
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

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wireframe);
  var barycentric = gl.getAttribLocation(program, 'barycentric');
  gl.vertexAttribPointer(barycentric, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(barycentric);

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
