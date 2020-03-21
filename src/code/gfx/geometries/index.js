import { subtract, cross } from '../matrices';
import { createBuffers } from '../buffers';

import { readOBJ } from './readOBJ';
import triangleOBJ from './triangle.obj';
import rectangleOBJ from './rectangle.obj';
import cubeOBJ from './cube.obj';
import cylinderOBJ from './cylinder.obj';
import sphereOBJ from './sphere.obj';

export function loadAllGeometries(gl) {
  const errors = [];
  const geometries = {};

  const triangleGeo = readOBJ('triangle', triangleOBJ, false);
  calculateNormals(triangleGeo);
  const rectangleGeo = readOBJ('rectangle', rectangleOBJ, true);
  calculateNormals(rectangleGeo);
  const cubeGeo = readOBJ('cube', cubeOBJ, true);
  calculateNormals(cubeGeo);
  const cylinderGeo = readOBJ('cylinder', cylinderOBJ, true);
  calculateNormals(cylinderGeo);
  const sphereGeo = readOBJ('sphere', sphereOBJ, true);
  calculateNormals(sphereGeo);
  [triangleGeo, rectangleGeo, cubeGeo, cylinderGeo, sphereGeo].forEach(geo => {
    try {
      const loaded = loadGeometry(gl, geo);
      geometries[geo.name] = loaded;
    } catch (e) {
      errors.push(e);
    }
  });

  return {
    errors,
    geometries,
  };
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

export function loadGeometry(gl, geometry) {
  const buffers = createBuffers(gl, geometry);
  return {
    buffers,
    geometry,
  };
}
