import { createBuffers } from './buffers';

export function loadAllGeometries(gl) {
  const errors = [];
  const geometries = {};

  [triangle, rectangle, cube].forEach(geo => {
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

export const triangle = {
  name: 'triangle',
  // prettier-ignore
  vertices: [
    0, 0.5, 0,  0.5,-0.5, 0,  -0.5,-0.5, 0,
  ],
  // prettier-ignore
  indices: [
    0, 1, 2,
  ],
  // prettier-ignore
  barycentrics: [
    0, 0, 1,  0, 1, 0,  1, 0, 0,
  ],
  // prettier-ignore
  texture: [
    0, 0,  0, 1,  1, 0,
  ]
};

export const rectangle = {
  name: 'rectangle',
  // prettier-ignore
  vertices: [
    -0.5, -0.5, 0,  0.5, -0.5, 0,  0.5, 0.5, 0,  -0.5, 0.5, 0,
  ],
  // prettier-ignore
  indices: [
    0, 1, 2,  0, 2, 3,
  ],
  // prettier-ignore
  barycentrics: [
    0, 0, 1,  0, 1, 0,  1, 1, 0,  0, 1, 0,
  ],
  // prettier-ignore
  texture: [
    0, 0,  0, 1,  1, 1,  1, 0,
  ]
};

export const cube = {
  name: 'cube',
  // prettier-ignore
  vertices: [
    -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,
    -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
  ],
  // prettier-ignore
  indices: [
    0, 1, 2,  0, 2, 3,  4, 7, 6,  4, 6, 5,
    5, 6, 2,  5, 2, 1,  3, 7, 4,  3, 4, 0,
    2, 6, 7,  2, 7, 3,  4, 5, 1,  4, 1, 0,
  ],
  // prettier-ignore
  barycentrics: [
    0, 0, 1,  0, 1, 0,  1, 1, 0,  0, 1, 0,
    1, 0, 1,  0, 0, 1,  0, 1, 0,  0, 0, 1,
  ],
  // prettier-ignore
  texture: [
    0, 0,  0, 1,  1, 1,  0, 1,
    1, 0,  0, 0,  0, 1,  0, 0,
  ]
};
