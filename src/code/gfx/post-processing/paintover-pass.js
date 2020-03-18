import { PostProcessingError } from '../errors';
import { compileShaderProgram } from '../shaders';
import { paintover } from './shaders/paintover.yaml';

import { create2DTexture, createDepthTexture, createQuad } from './util';

export class PaintOverPass {
  constructor(gl, width, height) {
    this.gl = gl;

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
      paintover.vertexShader,
      paintover.fragmentShader
    );
    this.program = program;

    const positionAttrib = gl.getAttribLocation(program, 'position');
    if (positionAttrib === null)
      throw new PostProcessingError(
        'PaintOver',
        'WebGL could not get position attribute location'
      );

    const texcoordAttrib = gl.getAttribLocation(program, 'texcoord');
    if (texcoordAttrib === null)
      throw new PostProcessingError(
        'PaintOver',
        'WebGL could not get texcoord attribute location'
      );
    this.attributes = {
      position: positionAttrib,
      textureCoord: texcoordAttrib,
    };

    const newFrameUniform = gl.getUniformLocation(program, 'newFrame');
    if (newFrameUniform === null)
      throw new PostProcessingError(
        'PaintOver',
        'WebGL could not get newFrame uniform location'
      );

    const lastFrameUniform = gl.getUniformLocation(program, 'lastFrame');
    if (lastFrameUniform === null)
      throw new PostProcessingError(
        'PaintOver',
        'WebGL could not get lastFrame uniform location'
      );

    const depthUniform = gl.getUniformLocation(program, 'depth');
    if (depthUniform === null)
      throw new PostProcessingError(
        'PaintOver',
        'WebGL could not get depth uniform location'
      );
    this.uniforms = {
      LastFrame: lastFrameUniform,
      NewFrame: newFrameUniform,
      NewDepth: depthUniform,
    };
  }

  render(lastFrameTexture, newFrameTexture, newFrameDepth) {
    const gl = this.gl;

    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, lastFrameTexture);
    gl.uniform1i(this.uniforms.LastFrame, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, newFrameTexture);
    gl.uniform1i(this.uniforms.NewFrame, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, newFrameDepth);
    gl.uniform1i(this.uniforms.NewDepth, 2);

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

    gl.drawElements(
      gl.TRIANGLES,
      this.quad.geometries.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
