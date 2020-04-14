const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const sqrt = Math.sqrt;
const TORAD = Math.PI / 180;

export const vec3 = (x, y, z) => [x, y, z];

export function projectionMatrix(near, far, fov, aspect) {
  const ang = tan(fov * 0.5 * TORAD);
  const x = 1 / (aspect * ang);
  const y = 1 / ang;
  const fpn = far + near;
  const fmn = far - near;
  const oon = 0.5 / near;
  const oof = 0.5 / far;
  const z = -fpn / fmn;
  const w = 1 / (oof - oon);

  // prettier-ignore
  return [
    x, 0, 0,  0,
    0, y, 0,  0,
    0, 0, z, -1,
    0, 0, w,  0
  ];
}

export function lookAt(eye, target, up) {
  const za = normalize(subtract(target, eye));
  const xa = normalize(cross(za, up));
  const ya = cross(xa, za);
  // prettier-ignore
  return [
    xa[0],         ya[0],         -za[0],       0,
    xa[1],         ya[1],         -za[1],       0,
    xa[2],         ya[2],         -za[2],       0,
    -dot(xa, eye), -dot(ya, eye), dot(za, eye), 1,
  ];
}
export function oldprojectionMatrix(near, far, fov, aspect) {
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

export function oldlookAt(eye, target, up) {
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
  const v00 = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
  const v10 = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
  const v20 = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
  const v30 = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];

  const v01 = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
  const v11 = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
  const v21 = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
  const v31 = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];

  const v02 = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
  const v12 = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
  const v22 = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
  const v32 = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];

  const v03 = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
  const v13 = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
  const v23 = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
  const v33 = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
  // prettier-ignore
  return [
    v00, v10, v20, v30,
    v01, v11, v21, v31,
    v02, v12, v22, v32,
    v03, v13, v23, v33,
  ];
}

export function rotationXM44(angle) {
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    1, 0,          0,           0,
    0, cos(rads), -sin(rads), 0,
    0, sin(rads), cos(rads),  0,
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
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    cos(rads), -sin(rads), 0, 0,
    sin(rads), cos(rads),  0, 0,
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
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    xMove, yMove, zMove, 1,
  ];
}

export function scaleXYZM44(xScale, yScale, zScale) {
  // prettier-ignore
  return [
    xScale, 0, 0, 0,
    0, yScale, 0, 0,
    0, 0, zScale, 0,
    0, 0, 0, 1,
  ];
}
