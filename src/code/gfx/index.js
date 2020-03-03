import { projectionMatrix, lookAt, vec3, identityM44 } from './matrices';
import { makeShape, compileProgram, fragCode, vertCode } from './shaders';
import { cube } from './geometries';
import { multiplyM44 } from './matrices';

import { Stack } from '../util/stack';

export class IGfx {
  constructor(canvasEl, context) {
    this.canvas = canvasEl;
    this.canvas.width = canvasEl.clientWidth;
    this.canvas.height = canvasEl.clientHeight;
    this.ctx = context;

    this.pMatrix = projectionMatrix(
      1,
      100,
      45,
      this.canvas.width / this.canvas.height
    );
    this.vMatrix = lookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));

    this.matrixStack = new Stack(identityM44());
    this.fillStack = new Stack({ style: 'fill', color: [1, 1, 1, 1] });
    this.strokeStack = new Stack({ style: 'stroke', color: [0, 0, 0, 1] });
    this.strokeSizeStack = new Stack(0.02);

    this.geometries = {};
    this.loadShape('cube', cube, vertCode, fragCode);
  }

  loadShape(name, geometry, vertShader, fragShader) {
    this.geometries[name] = makeShape(
      this.ctx,
      compileProgram(this.ctx, vertShader, fragShader),
      geometry
    );
  }

  pushSnapshot() {
    this.matrixStack.pushSnapshot();
    this.fillStack.pushSnapshot();
    this.strokeStack.pushSnapshot();
    this.strokeSizeStack.pushSnapshot();
  }

  popSnapshot() {
    this.matrixStack.popSnapshot();
    this.fillStack.popSnapshot();
    this.strokeStack.popSnapshot();
    this.strokeSizeStack.popSnapshot();
  }

  drawShape(name, sizeMatrix) {
    const gl = this.ctx;
    const shape = this.geometries[name];
    const fillStyle = this.fillStack.top();
    const fillColor =
      fillStyle.style === 'fill' ? fillStyle.color : [0, 0, 0, 0];
    const strokeStyle = this.strokeStack.top();
    const strokeColor =
      strokeStyle.style === 'stroke' ? strokeStyle.color : fillColor;
    const strokeSize = this.strokeSizeStack.top();
    const mMatrix = multiplyM44(sizeMatrix, this.matrixStack.top());
    gl.uniformMatrix4fv(shape.uniforms.Pmatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(shape.uniforms.Vmatrix, false, this.vMatrix);
    gl.uniformMatrix4fv(shape.uniforms.Mmatrix, false, mMatrix);
    gl.uniform4fv(shape.uniforms.Color, fillColor);
    gl.uniform4fv(shape.uniforms.WireColor, strokeColor);
    gl.uniform1f(shape.uniforms.StrokeSize, strokeSize);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.buffers.index);

    gl.cullFace(gl.FRONT);
    gl.drawElements(
      gl.TRIANGLES,
      shape.geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );

    gl.cullFace(gl.BACK);
    gl.drawElements(
      gl.TRIANGLES,
      shape.geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  reset() {
    const gl = this.ctx;

    this.matrixStack.reset();
    this.fillStack.reset();
    this.strokeStack.reset();

    gl.frontFace(gl.CW);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(1, 1, 1, 1);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
