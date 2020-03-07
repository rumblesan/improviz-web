import { createSavePass } from './util';

export class PostProcessing {
  constructor(canvas, gl) {
    this.canvas = canvas;
    this.gl = gl;
    this.defaultFramebuffer = null;
    this.savePass = createSavePass(gl, canvas.width, canvas.height);
  }

  use() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.savePass.framebuffer);
  }

  render() {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.defaultFramebuffer);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(1, 0, 0, 1);

    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const { program, attributes, uniforms, quad, texture } = this.savePass;

    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.Texture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.vertex);
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attributes.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.texture);
    gl.vertexAttribPointer(attributes.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attributes.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.index);

    gl.drawArrays(gl.TRIANGLES, 0, quad.index.length);
    gl.drawElements(
      gl.TRIANGLES,
      quad.geometries.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  skip() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.defaultFramebuffer);
  }
}
