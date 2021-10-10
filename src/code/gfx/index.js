import { PostProcessing } from './post-processing';
import { projectionMatrix, lookAt, vec3, identityM44 } from './matrices';

import { loadGeometryOBJ } from './geometries';
import { loadTextureFromURL, removeTexture } from './textures';
import { loadMaterialYAML } from './materials';

import { Stack } from '../util/stack';
import { CrossFrameSetting } from '../util/cross-frame-setting';

const exists = a => a !== null && a !== undefined;

export class IGfx {
  constructor(canvasEl, context) {
    this.canvas = canvasEl;
    this.canvas.width = canvasEl.clientWidth;
    this.canvas.height = canvasEl.clientHeight;
    this.gl = context;
    this.geometries = {};
    this.materials = {};
    this.textures = {};

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
    return exists(t) ? t.texture : null;
  }

  getAllTextures() {
    return this.textures;
  }

  loadTexture({name, url}) {
    return loadTextureFromURL(this.gl, {name, url})
      .then(texture => {
        this.textures[name] = texture;
      }).catch(error => {
        console.error(error);
      });
  }

  unloadTexture(name) {
    const t = this.textures[name];
    if (t) {
      removeTexture(this.gl, t.texture);
      delete this.textures[name];
    }
  }

  loadMaterial(material) {
    try {
      const loaded = loadMaterialYAML(this.gl, material);
      this.materials[loaded.name] = loaded;
    } catch (e) {
      console.error(e);
    }
  }

  loadGeometry(name, geometry, removeCrossBar = false) {
    try {
      const loaded = loadGeometryOBJ(this.gl, name, geometry, removeCrossBar);
      this.geometries[loaded.name] = loaded;
    } catch (e) {
      console.error(e);
    }
  }

  setUniform(name, location) {
    switch (name) {
      case 'Pmatrix':
        // transpose is true because our matrices are flat arrays in row-major format
        this.gl.uniformMatrix4fv(location, true, this.pMatrix);
        break;
      case 'Vmatrix':
        // transpose is true because our matrices are flat arrays in row-major format
        this.gl.uniformMatrix4fv(location, true, this.vMatrix);
        break;
      case 'Mmatrix':
        // transpose is true because our matrices are flat arrays in row-major format
        this.gl.uniformMatrix4fv(location, true, this.matrixStack.top());
        break;
      case 'Color':
        this.gl.uniform4fv(location, this.getFillColor());
        break;
      case 'WireColor':
        this.gl.uniform4fv(location, this.getStrokeColor(this.getFillColor()));
        break;
      case 'StrokeSize':
        this.gl.uniform1f(location, this.strokeSizeStack.top());
        break;
      case 'Texture':
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture());
        this.gl.uniform1i(location, 0);
        break;
      default:
        console.log(`${name} is an unknown uniform location`);
    }
  }

  setAttribute(name, attrib, buffers) {
    switch (name) {
      case 'position':
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.vertex);
        this.gl.vertexAttribPointer(attrib, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
        break;
      case 'normals':
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normals);
        this.gl.vertexAttribPointer(attrib, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
        break;
      case 'barycentric':
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.wireframe);
        this.gl.vertexAttribPointer(attrib, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
        break;
      case 'textureCoord':
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.texture);
        this.gl.vertexAttribPointer(attrib, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(attrib);
        break;
    }
  }

  drawShape(name) {
    const gl = this.gl;

    const materialName = this.materialStack.top();
    const material = this.materials[materialName];
    // FIXME raise an error?
    if (!material) return;

    // FIXME raise an error?
    const shape = this.geometries[name];
    if (!shape) return;

    gl.useProgram(material.program);

    Object.entries(material.uniforms).forEach(([name, location]) =>
      this.setUniform(name, location)
    );

    Object.entries(material.attributes).forEach(([name, location]) =>
      this.setAttribute(name, location, shape.buffers)
    );

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
