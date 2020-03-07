import { GFXError } from '../errors';
import { compileShaderProgram } from '../shaders';
import { savebuffer } from './shaders/savebuffer.yaml';

export const quad = {
  // prettier-ignore
  vertices: [
    -1, -1, 0,  1, -1, 0,  1, 1, 0,  -1, 1, 0,
  ],
  // prettier-ignore
  indices: [
    0, 3, 2,  0, 2, 1,
  ],
  // prettier-ignore
  texture: [
    0, 0,  1, 0,  1, 1,  0, 1,
  ]
};

export function createQuad(gl) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(quad.vertices),
    gl.STATIC_DRAW
  );

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(quad.texture),
    gl.STATIC_DRAW
  );

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(quad.indices),
    gl.STATIC_DRAW
  );

  return {
    vertex: vertexBuffer,
    texture: textureCoordBuffer,
    index: indexBuffer,
    geometries: quad,
  };
}

export function create2DTexture(gl, width, height) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    width,
    height,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    null
  );

  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return tex;
}

export function createDepthTexture(gl, width, height) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    width,
    height,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );

  return tex;
}

export function createSavePass(gl, width, height) {
  /* Create framebuffer used for drawing to the save pass texture */
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

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

  const renderQuad = createQuad(gl);

  const program = compileShaderProgram(
    gl,
    savebuffer.vertexShader,
    savebuffer.fragmentShader
  );

  const positionAttrib = gl.getAttribLocation(program, 'position');
  if (positionAttrib === null)
    throw new GFXError(`WebGL could not get position attribute location`);

  const texcoordAttrib = gl.getAttribLocation(program, 'texcoord');
  if (texcoordAttrib === null)
    throw new GFXError(`WebGL could not get position attribute location`);

  const textureUniform = gl.getUniformLocation(program, 'Texture');
  if (textureUniform === null)
    throw new GFXError(`WebGL could not get position attribute location`);

  return {
    quad: renderQuad,
    program,
    attributes: {
      position: positionAttrib,
      textureCoord: texcoordAttrib,
    },
    uniforms: {
      Texture: textureUniform,
    },
    framebuffer: fb,
    texture: drawTexture,
    depth: depthTexture,
  };
}
