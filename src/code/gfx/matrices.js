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
    x, 0,  0, 0,
    0, y,  0, 0,
    0, 0,  z, w,
    0, 0, -1, 0
  ];
}

export function lookAt(eye, target, up) {
  const za = normalize(subtract(target, eye));
  const xa = normalize(cross(za, up));
  const ya = cross(xa, za);
  // prettier-ignore
  return [
    xa[0],  xa[1],  xa[2],  -dot(xa, eye),
    ya[0],  ya[1],  ya[2],  -dot(ya, eye),
    -za[0], -za[1], -za[2], dot(za, eye),
    0,      0,      0,      1
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
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    1, 0,          0,         0,
    0, cos(rads), -sin(rads), 0,
    0, sin(rads), cos(rads),  0,
    0, 0,          0,         1,
  ];
}

export function rotationYM44(angle) {
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    cos(rads),  0, sin(rads), 0,
    0,          1, 0,         0,
    -sin(rads), 0, cos(rads), 0,
    0,          0, 0,         1,
  ];
}

export function rotationZM44(angle) {
  const rads = angle * TORAD;
  // prettier-ignore
  return [
    cos(rads), -sin(rads), 0, 0,
    sin(rads), cos(rads),  0, 0,
    0,         0,          1, 0,
    0,         0,          0, 1,
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
    cy*cz,                      cy*-sz,       sy, 0,
    sx*sy*cz + cx*sz, cx*cz - sx*sy*sz, -sx * cy, 0,
    sx*sz - cx*sy*cz, cx*sy*sz + sx*cz,    cx*cy, 0,
                   0,                0,        0, 1,
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

export function scaleXYZM44(xScale, yScale, zScale) {
  // prettier-ignore
  return [
    xScale, 0, 0, 0,
    0, yScale, 0, 0,
    0, 0, zScale, 0,
    0, 0, 0, 1,
  ];
}
