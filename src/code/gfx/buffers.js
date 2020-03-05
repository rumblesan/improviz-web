export function createBuffers(gl, geometry) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(geometry.vertices),
    gl.STATIC_DRAW
  );

  const wireframeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wireframeBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(geometry.barycentrics),
    gl.STATIC_DRAW
  );

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint16Array(geometry.texture),
    gl.STATIC_DRAW
  );

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(geometry.indices),
    gl.STATIC_DRAW
  );

  return {
    vertex: vertexBuffer,
    wireframe: wireframeBuffer,
    texture: textureCoordBuffer,
    index: indexBuffer,
  };
}
