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

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return tex;
}

export function createDepthTexture(gl, width, height) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT,
    width,
    height,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return tex;
}
