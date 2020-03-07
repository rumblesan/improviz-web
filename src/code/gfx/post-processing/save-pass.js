import { GFXError } from '../errors';
import { compileShaderProgram } from '../shaders';
import { savebuffer } from './shaders/savebuffer.yaml';

import { create2DTexture, createDepthTexture, createQuad } from './util';

export class SavePass {
  constructor(gl, width, height) {
    this.gl = gl;

    /* Create framebuffer used for drawing to the save pass texture */
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    this.framebuffer = framebuffer;

    const depthTexture = createDepthTexture(gl, width, height);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      depthTexture,
      0
    );

    const drawTexture = create2DTexture(gl, width, height);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      drawTexture,
      0
    );
    this.textures = {
      draw: drawTexture,
      depth: depthTexture,
    };
    this.texture = drawTexture;

    const renderQuad = createQuad(gl);
    this.quad = renderQuad;

    const program = compileShaderProgram(
      gl,
      savebuffer.vertexShader,
      savebuffer.fragmentShader
    );
    this.program = program;

    const positionAttrib = gl.getAttribLocation(program, 'position');
    if (positionAttrib === null)
      throw new GFXError(`WebGL could not get position attribute location`);

    const texcoordAttrib = gl.getAttribLocation(program, 'texcoord');
    if (texcoordAttrib === null)
      throw new GFXError(`WebGL could not get position attribute location`);
    this.attributes = {
      position: positionAttrib,
      textureCoord: texcoordAttrib,
    };

    const textureUniform = gl.getUniformLocation(program, 'Texture');
    if (textureUniform === null)
      throw new GFXError(`WebGL could not get position attribute location`);
    this.uniforms = {
      Texture: textureUniform,
    };
  }

  render() {
    const gl = this.gl;

    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.draw);
    gl.uniform1i(this.uniforms.Texture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertex);
    gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.attributes.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.texture);
    gl.vertexAttribPointer(
      this.attributes.textureCoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.attributes.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.index);

    gl.drawArrays(gl.TRIANGLES, 0, this.quad.index.length);
    gl.drawElements(
      gl.TRIANGLES,
      this.quad.geometries.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
