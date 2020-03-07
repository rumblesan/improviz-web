import { SavePass } from './save-pass';
import { PaintOverPass } from './paintover-pass';

export class PostProcessing {
  constructor(canvas, gl) {
    this.canvas = canvas;
    this.gl = gl;
    this.defaultFramebuffer = null;
    this.inputPass = new SavePass(gl, canvas.width, canvas.height);
    this.paintOverPass = new PaintOverPass(gl, canvas.width, canvas.height);
    this.blendedPass = new SavePass(gl, canvas.width, canvas.height);
    this.outputPass = new SavePass(gl, canvas.width, canvas.height);
  }

  use() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.inputPass.framebuffer);
  }

  render(mode) {
    switch (mode) {
      case 'paintover':
        this.renderPaintOver();
        break;
      default:
        this.renderNormal();
        break;
    }
  }

  renderPaintOver() {
    const gl = this.gl;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.blendedPass.framebuffer);

    this.paintOverPass.render(
      this.outputPass.textures.draw,
      this.inputPass.textures.draw,
      this.inputPass.textures.depth
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.outputPass.framebuffer);
    this.blendedPass.render();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.defaultFramebuffer);
    this.outputPass.render();
  }

  renderNormal() {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.outputPass.framebuffer);
    this.inputPass.render();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.defaultFramebuffer);
    this.outputPass.render();
  }

  skip() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.defaultFramebuffer);
  }
}
