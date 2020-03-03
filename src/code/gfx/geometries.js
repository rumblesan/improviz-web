export const cube = {
  // prettier-ignore
  vertices: [
    -1,-1,-1,   1,-1,-1,   1, 1,-1,  -1, 1,-1,
    -1,-1, 1,   1,-1, 1,   1, 1, 1,  -1, 1, 1,
  ],
  // prettier-ignore
  indices: [
    0, 1, 2,  0, 2, 3,  4, 7, 6,  4, 6, 5,
    5, 6, 2,  5, 2, 1,  3, 7, 4,  3, 4, 0,
    2, 6, 7,  2, 7, 3,  4, 5, 1,  4, 1, 0,
  ],
  // prettier-ignore
  barycentrics: [
    0, 0, 1,   0, 1, 0,   1, 1, 0,   0, 1, 0,
    1, 0, 1,   0, 0, 1,   0, 1, 0,   0, 0, 1,
  ]
};
