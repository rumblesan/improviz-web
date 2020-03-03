import { dedent } from 'dentist';

import { createBuffers } from './buffers';

export const vertCode = dedent(`
  attribute vec3 position;
  attribute vec3 barycentric;
  uniform mat4 Pmatrix;
  uniform mat4 Vmatrix;
  uniform mat4 Mmatrix;
  uniform vec4 Color;
  uniform vec4 WireColor;
  uniform float StrokeSize;
  varying vec4 vColor;
  varying vec4 vWireColor;
  varying vec3 vbc;
  varying float vStrokeSize;
  void main(void) { 
    gl_Position = ((Pmatrix * Vmatrix) * Mmatrix) * vec4(position, 1.);
    vColor = Color;
    vWireColor = WireColor;
    vbc = barycentric;
    vStrokeSize = StrokeSize;
  }
`);

export const fragCode = dedent(`
  precision mediump float;
  varying vec4 vColor;
  varying vec4 vWireColor;
  varying vec3 vbc;
  varying float vStrokeSize;
  void main(void) {
    if(vbc.x < vStrokeSize || vbc.y < vStrokeSize || vbc.z < vStrokeSize) {
      gl_FragColor = vWireColor;
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
  var WireColor = gl.getUniformLocation(program, 'WireColor');
  var StrokeSize = gl.getUniformLocation(program, 'StrokeSize');

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
      WireColor,
      StrokeSize,
    },
    geometry,
  };
}
