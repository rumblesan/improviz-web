import {
  projectionMatrix,
  lookAt,
  vec3,
  identityM44,
  multiplyM44,
  rotationXM44,
  rotationYM44,
  rotationZM44,
} from './matrices';
import { makeShape, compileProgram, fragCode, vertCode } from './shaders';
import { cube } from './geometries';

export class IGfx {
  constructor(canvasEl, context) {
    this.canvas = canvasEl;
    this.canvas.width = canvasEl.clientWidth;
    this.canvas.height = canvasEl.clientHeight;
    this.ctx = context;
  }

  setup() {
    this.pMatrix = projectionMatrix(
      1,
      100,
      45,
      this.canvas.width / this.canvas.height
    );
    this.vMatrix = lookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));

    this.matrixStack = [identityM44()];

    this.cube = makeShape(
      this.ctx,
      compileProgram(this.ctx, vertCode, fragCode),
      cube
    );
  }

  getMatrix() {
    return this.matrixStack[this.matrixStack.length - 1];
  }

  pushMatrix(m) {
    const top = this.getMatrix();
    const newM = multiplyM44(m, top);
    this.matrixStack.push(newM);
  }

  popMatrix() {
    return this.matrixStack.pop();
  }

  resetMatrix() {
    this.matrixStack = [identityM44()];
  }

  drawShape(shape, color) {
    const gl = this.ctx;
    gl.uniformMatrix4fv(shape.uniforms.Pmatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(shape.uniforms.Vmatrix, false, this.vMatrix);
    gl.uniformMatrix4fv(shape.uniforms.Mmatrix, false, this.getMatrix());
    gl.uniform3fv(shape.uniforms.Color, color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.buffers.index);
    gl.drawElements(
      gl.TRIANGLES,
      shape.geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  start() {
    const gl = this.ctx;
    const animate = time => {
      this.resetMatrix();
      this.pushMatrix(rotationXM44(time * 0.05 * (Math.PI / 180)));
      this.pushMatrix(rotationYM44(time * 0.05 * (Math.PI / 180)));
      this.pushMatrix(rotationZM44(time * 0.05 * (Math.PI / 180)));

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clearColor(1, 1, 1, 0.9);
      gl.clearDepth(1.0);

      gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.drawShape(this.cube, [1, 0, 0]);

      window.requestAnimationFrame(animate);
    };
    animate(0);
  }
}
