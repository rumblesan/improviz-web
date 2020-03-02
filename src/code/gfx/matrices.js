const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const sqrt = Math.sqrt;
const TORAD = Math.PI / 180;

export const vec3 = (x, y, z) => [x, y, z];

export function projectionMatrix(near, far, fov, aspect) {
  const ang = tan(fov * 0.5 * TORAD);
  const top = near * ang;
  const bottom = -top;
  const right = top * aspect;
  const left = -right;

  const m00 = (2 * near) / (right - left);
  const m02 = (right + left) / (right - left);

  const m11 = (2 * near) / (top - bottom);
  const m12 = (top + bottom) / (top - bottom);

  const m22 = -((far + near) / (far - near));
  const m23 = -((2 * far * near) / (far - near));

  // prettier-ignore
  return [
    m00, 0,   m02, 0,
    0,   m11, m12, 0,
    0,   0,   m22, m23,
    0,   0,   -1,  0
  ];
}

export function lookAt(eye, target, up) {
  const zaxis = normalize(subtract(eye, target));
  const xaxis = normalize(cross(up, zaxis));
  const yaxis = cross(zaxis, xaxis);
  // prettier-ignore
  const orientation = [
    xaxis[0], yaxis[0], zaxis[0], 0,
    xaxis[1], yaxis[1], zaxis[1], 0,
    xaxis[2], yaxis[2], zaxis[2], 0,
    0,        0,        0,        1,
  ];
  // prettier-ignore
  const translation = [
    1,       0,       0,       0,
    0,       1,       0,       0,
    0,       0,       1,       0,
    -eye[0], -eye[1], -eye[2], 1,
  ];
  return multiplyM44(orientation, translation);
}
export function createViewMatrix(eye, target, up) {
  const zaxis = normalize(subtract(eye, target));
  const xaxis = normalize(cross(up, zaxis));
  const yaxis = cross(zaxis, xaxis);
  // prettier-ignore
  return [
    xaxis[0], xaxis[1], xaxis[2], -dot(xaxis, eye),
    yaxis[0], yaxis[1], yaxis[2], -dot(yaxis, eye),
    zaxis[0], zaxis[1], zaxis[2], -dot(zaxis, eye),
    0,        0,        0,        1,
  ];
}

// making assumptions that all our matrices are flat arrays of numbers
// and that they're all the same lengths
export function copy(m) {
  return m.map(v => v);
}

export function add(a, b) {
  return a.map((v, idx) => v + b[idx]);
}

export function subtract(a, b) {
  return a.map((v, idx) => v - b[idx]);
}

export function vecLength(m) {
  return sqrt(m.reduce((accum, v) => accum + v * v, 0));
}

export function normalize(m) {
  const length = vecLength(m);
  return m.map(v => v / length);
}

export function cross(a, b) {
  const cx = a[1] * b[2] - a[2] * b[1];
  const cy = a[2] * b[0] - a[0] * b[2];
  const cz = a[0] * b[1] - a[1] * b[0];
  return [cx, cy, cz];
}

export function dot(a, b) {
  return a.reduce((accum, v, idx) => accum + v * b[idx], 0);
}

/* Matrix Manipulation */

export function identityM44() {
  // prettier-ignore
  return [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];
}

export function multiplyM44(a, b) {
  const v00 = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  const v10 = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  const v20 = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  const v30 = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  const v01 = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  const v11 = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  const v21 = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  const v31 = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  const v02 = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  const v12 = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  const v22 = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  const v32 = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  const v03 = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  const v13 = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  const v23 = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  const v33 = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
  // prettier-ignore
  return [
    v00, v10, v20, v30,
    v01, v11, v21, v31,
    v02, v12, v22, v32,
    v03, v13, v23, v33,
  ];
}

export function rotationXM44(angle) {
  // prettier-ignore
  return [
    1, 0,          0,           0,
    0, cos(angle), -sin(angle), 0,
    0, sin(angle), cos(angle),  0,
    0, 0,          0,           1,
  ];
}

export function rotationYM44(angle) {
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    cos(rads),  0, sin(rads), 0,
    0,           1, 0,          0,
    -sin(rads), 0, cos(rads), 0,
    0,           0, 0,          1,
  ];
}

export function rotationZM44(angle) {
  // prettier-ignore
  return [
    cos(angle), -sin(angle), 0, 0,
    sin(angle), cos(angle),  0, 0,
    0, 0,          1,           0,
    0, 0,          0,           1,
  ];
}

export function rotationXYZM44(xAngle, yAngle, zAngle) {
  const xRads = xAngle * TORAD;
  const yRads = yAngle * TORAD;
  const zRads = zAngle * TORAD;

  const sx = sin(xRads);
  const cx = cos(xRads);
  const sy = sin(yRads);
  const cy = cos(yRads);
  const sz = sin(zRads);
  const cz = cos(zRads);

  // prettier-ignore
  return [
    cx*cy, cx*sy*sz - sx*cz, cx*sy*cz + sx*sz, 0,
    sx*cy, sx*sy*sz + cx*cz, sx*sy*cz - cx*sz, 0,
    -sy,   cy*sz,            cy*cz,            0,
    0,     0,                0,                1,
  ];
}

export function moveXYZM44(xMove, yMove, zMove) {
  // prettier-ignore
  return [
    1, 0, 0, xMove,
    0, 1, 0, yMove,
    0, 0, 1, zMove,
    0, 0, 0, 1,
  ];
}
