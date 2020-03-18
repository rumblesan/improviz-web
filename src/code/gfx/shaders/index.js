import { ShaderError } from '../errors';

export function compileShaderProgram(gl, name, vc, fc) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  if (vertShader === null) {
    throw new ShaderError(name, 'WebGL could not create vertex shader');
  }
  gl.shaderSource(vertShader, vc);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    throw new ShaderError(
      name,
      `Could not compile vertex shader: ${gl.getShaderInfoLog(vertShader)}`
    );
  }

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (fragShader === null) {
    throw new ShaderError(name, 'WebGL could not create fragment shader');
  }
  gl.shaderSource(fragShader, fc);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    throw new ShaderError(
      name,
      `Could not compile fragment shader: ${gl.getShaderInfoLog(fragShader)}`
    );
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new ShaderError(
      name,
      `Could not compile shader program: ${gl.getShaderInfoLog(program)}`
    );
  }

  return program;
}
