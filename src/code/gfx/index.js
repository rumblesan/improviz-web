import { PostProcessing } from './post-processing';
import { projectionMatrix, lookAt, vec3, identityM44 } from './matrices';
import { loadAllGeometries } from './geometries';
import { loadAllTextures } from './textures';
import { loadAllMaterials } from './materials';
import { multiplyM44 } from './matrices';

import { Stack } from '../util/stack';
import { CrossFrameSetting } from '../util/cross-frame-setting';

const exists = a => a !== null && a !== undefined;

export class IGfx {
  constructor(canvasEl, context) {
    this.canvas = canvasEl;
    this.canvas.width = canvasEl.clientWidth;
    this.canvas.height = canvasEl.clientHeight;
    this.gl = context;

    this.pMatrix = projectionMatrix(
      0.1,
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
    this.textureStack = new Stack('crystal');

    this.background = new CrossFrameSetting([1, 1, 1]);
    this.depthCheck = new CrossFrameSetting(true);
    this.renderMode = new CrossFrameSetting('normal');

    const loadedGeometries = loadAllGeometries(this.gl);
    loadedGeometries.errors.forEach(e => console.log(e));
    this.geometries = loadedGeometries.geometries;

    const loadedMaterials = loadAllMaterials(this.gl);
    loadedMaterials.errors.forEach(e => console.log(e));
    this.materials = loadedMaterials.materials;

    const loadedTextures = loadAllTextures(this.gl);
    loadedTextures.errors.forEach(e => console.log(e));
    this.textures = loadedTextures.textures;

    this.postProcessing = new PostProcessing(this.canvas, this.gl);
  }

  pushSnapshot() {
    this.matrixStack.pushSnapshot();
    this.fillStack.pushSnapshot();
    this.strokeStack.pushSnapshot();
    this.strokeSizeStack.pushSnapshot();
    this.materialStack.pushSnapshot();
    this.textureStack.pushSnapshot();
  }

  popSnapshot() {
    this.matrixStack.popSnapshot();
    this.fillStack.popSnapshot();
    this.strokeStack.popSnapshot();
    this.strokeSizeStack.popSnapshot();
    this.materialStack.popSnapshot();
    this.textureStack.pushSnapshot();
  }

  getFillColor() {
    const fillStyle = this.fillStack.top();
    return fillStyle.style === 'fill' ? fillStyle.color : [0, 0, 0, 0];
  }

  getStrokeColor(fallback) {
    const strokeStyle = this.strokeStack.top();
    return strokeStyle.style === 'stroke' ? strokeStyle.color : fallback;
  }

  getTexture() {
    const name = this.textureStack.top();
    const t = this.textures[name];
    return exists(t) ? t : this.textures.crystal;
  }

  drawShape(name, sizeMatrix) {
    const gl = this.gl;

    const materialName = this.materialStack.top();
    const material = this.materials[materialName];
    // FIXME raise an error?
    if (!material) return;

    // FIXME raise an error?
    const shape = this.geometries[name];
    if (!shape) return;

    const { program, attributes, uniforms } = material;
    const { buffers, geometry } = shape;

    gl.useProgram(program);

    if (uniforms.Pmatrix !== null) {
      gl.uniformMatrix4fv(uniforms.Pmatrix, true, this.pMatrix);
    }

    if (uniforms.Vmatrix !== null) {
      gl.uniformMatrix4fv(uniforms.Vmatrix, true, this.vMatrix);
    }

    if (uniforms.Mmatrix !== null) {
      const mMatrix = multiplyM44(this.matrixStack.top(), sizeMatrix);
      gl.uniformMatrix4fv(uniforms.Mmatrix, true, mMatrix);
    }

    let fillColor;
    if (exists(uniforms.Color)) {
      fillColor = this.getFillColor();
      gl.uniform4fv(uniforms.Color, fillColor);
    }
    if (exists(uniforms.WireColor)) {
      const strokeColor = this.getStrokeColor(fillColor);
      gl.uniform4fv(uniforms.WireColor, strokeColor);
    }
    if (exists(uniforms.StrokeSize)) {
      const strokeSize = this.strokeSizeStack.top();
      gl.uniform1f(uniforms.StrokeSize, strokeSize);
    }

    if (exists(uniforms.Texture)) {
      const texture = this.getTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.Texture, 0);
    }

    if (exists(attributes.position) && exists(buffers.vertex)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
      gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attributes.position);
    }

    if (exists(attributes.normals) && exists(buffers.normals)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
      gl.vertexAttribPointer(attributes.normals, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attributes.normals);
    }

    if (exists(attributes.barycentric) && exists(buffers.wireframe)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.wireframe);
      gl.vertexAttribPointer(attributes.barycentric, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attributes.barycentric);
    }

    if (exists(attributes.textureCoord) && exists(buffers.texture)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
      gl.vertexAttribPointer(attributes.textureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attributes.textureCoord);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    gl.cullFace(gl.FRONT);
    gl.drawElements(
      gl.TRIANGLES,
      geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );

    gl.cullFace(gl.BACK);
    gl.drawElements(
      gl.TRIANGLES,
      geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  init() {
    this.begin();
    this.end();
  }

  begin() {
    const gl = this.gl;

    this.postProcessing.use();

    this.matrixStack.reset();
    this.fillStack.reset();
    this.strokeStack.reset();
    this.strokeSizeStack.reset();
    this.materialStack.reset();
    this.textureStack.reset();

    this.background.reset();
    this.depthCheck.reset();
    this.renderMode.reset();

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

  end() {
    const renderMode = this.renderMode.get();
    this.postProcessing.render(renderMode);
  }
}
