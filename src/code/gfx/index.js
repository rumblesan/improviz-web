import { projectionMatrix, lookAt, vec3, identityM44 } from './matrices';
import { loadMaterial } from './shaders';
import { loadGeometry, triangle, rectangle, cube } from './geometries';
import { loadTexture } from './textures';
import { multiplyM44 } from './matrices';

import { Stack } from '../util/stack';
import { CrossFrameSetting } from '../util/cross-frame-setting';

import { material as basicMaterial } from './materials/basic.yaml';
import { material as weirdMaterial } from './materials/weird.yaml';
import { material as textureMaterial } from './materials/texture.yaml';

import crystal from '../../textures/crystal.bmp';

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
    this.materialStack = new Stack('basic');

    this.background = new CrossFrameSetting([1, 1, 1]);
    this.depthCheck = new CrossFrameSetting(true);

    this.geometries = {
      triangle: loadGeometry(this.ctx, triangle),
      cube: loadGeometry(this.ctx, cube),
      rectangle: loadGeometry(this.ctx, rectangle),
    };

    this.materials = {
      basic: loadMaterial(this.ctx, basicMaterial),
      weird: loadMaterial(this.ctx, weirdMaterial),
      texture: loadMaterial(this.ctx, textureMaterial),
    };

    this.textures = {
      crystal: loadTexture(this.ctx, crystal),
    };
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

  getFillColor() {
    const fillStyle = this.fillStack.top();
    return fillStyle.style === 'fill' ? fillStyle.color : [0, 0, 0, 0];
  }

  getStrokeColor(fallback) {
    const strokeStyle = this.strokeStack.top();
    return strokeStyle.style === 'stroke' ? strokeStyle.color : fallback;
  }

  setupMaterial(material, sizeMatrix) {
    const gl = this.ctx;

    gl.useProgram(material.program);

    if (material.uniforms.Pmatrix) {
      gl.uniformMatrix4fv(material.uniforms.Pmatrix, false, this.pMatrix);
    }

    if (material.uniforms.Vmatrix) {
      gl.uniformMatrix4fv(material.uniforms.Vmatrix, false, this.vMatrix);
    }

    if (material.uniforms.Vmatrix) {
      const mMatrix = multiplyM44(sizeMatrix, this.matrixStack.top());
      gl.uniformMatrix4fv(material.uniforms.Mmatrix, false, mMatrix);
    }

    let fillColor;
    if (material.uniforms.Color) {
      fillColor = this.getFillColor();
      gl.uniform4fv(material.uniforms.Color, fillColor);
    }
    if (material.uniforms.WireColor) {
      const strokeColor = this.getStrokeColor(fillColor);
      gl.uniform4fv(material.uniforms.WireColor, strokeColor);
    }
    if (material.uniforms.StrokeSize) {
      const strokeSize = this.strokeSizeStack.top();
      gl.uniform1f(material.uniforms.StrokeSize, strokeSize);
    }
  }

  drawShape(name, sizeMatrix) {
    const gl = this.ctx;

    const shape = this.geometries[name];
    if (!shape) return;

    const materialName = this.materialStack.top();
    const material = this.materials[materialName];
    // FIXME raise an error?
    if (!material) return;

    this.setupMaterial(material, sizeMatrix);

    gl.enableVertexAttribArray(material.attributes.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffers.vertex);
    gl.vertexAttribPointer(
      material.attributes.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.enableVertexAttribArray(material.attributes.barycentric);
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffers.wireframe);
    gl.vertexAttribPointer(
      material.attributes.barycentric,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.buffers.index);

    //gl.bindVertexArray(shape.vao);

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
    this.background.reset();
    this.depthCheck.reset();

    gl.frontFace(gl.CW);
    gl.enable(gl.CULL_FACE);
    if (this.depthCheck.get()) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const [r, g, b] = this.background.get();
    gl.clearColor(r, g, b, 1);

    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
