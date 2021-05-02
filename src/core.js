import { Improviz } from './code/improviz';
import { IGfx } from './code/gfx';

export function createImproviz(canvas) {
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    return { status: 'error', message: 'Could not create WebGL2 context' };
  }

  const gfx = new IGfx(canvas, gl);

  const improviz = new Improviz(gfx);

  return { status: 'ok', improviz };
}
