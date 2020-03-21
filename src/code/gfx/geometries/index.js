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

  const triangleGeo = readOBJ('triangle', triangleOBJ);
  const rectangleGeo = readOBJ('rectangle', rectangleOBJ, true);
  const cubeGeo = readOBJ('cube', cubeOBJ, true);
  const cylinderGeo = readOBJ('cylinder', cylinderOBJ, true);
  const sphereGeo = readOBJ('sphere', sphereOBJ, true);
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

export function loadGeometry(gl, geometry) {
  const buffers = createBuffers(gl, geometry);
  return {
    buffers,
    geometry,
  };
}
