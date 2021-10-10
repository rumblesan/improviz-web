import { subtract, cross } from '../matrices';
import { createBuffers } from '../buffers';

import { readOBJ } from './readOBJ';

export function loadGeometryOBJ(gl, name, geometryOBJ, removeCrossBar) {
  const geo = readOBJ(name, geometryOBJ, removeCrossBar);
  calculateNormals(geo);
  return loadGeometry(gl, name, geo);
}

function calculateNormals(geometry) {
  if (geometry.normals.length < 1) {
    const verts = geometry.vertices;
    for (let i = 0; i < verts.length; i += 9) {
      let v1 = [verts[i + 0], verts[i + 1], verts[i + 2]];
      let v2 = [verts[i + 3], verts[i + 4], verts[i + 5]];
      let v3 = [verts[i + 6], verts[i + 7], verts[i + 8]];
      let fnorm = calculateFaceNormal(v1, v2, v3);
      // push three copies of the normal for each vertex
      fnorm.forEach(n => geometry.normals.push(n));
      fnorm.forEach(n => geometry.normals.push(n));
      fnorm.forEach(n => geometry.normals.push(n));
    }
  }
}

function calculateFaceNormal(v1, v2, v3) {
  return cross(subtract(v1, v2), subtract(v2, v3));
}

export function loadGeometry(gl, name, geometry) {
  const buffers = createBuffers(gl, geometry);
  return {
    name,
    buffers,
    geometry,
  };
}
