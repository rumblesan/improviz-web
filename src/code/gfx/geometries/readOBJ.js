export function readOBJ(name, fileData, removeCrossBar = false) {
  const fileLines = fileData.split('\n');
  let vertices = [];
  let faces = [];
  //let wireLines = [];
  let normals = [];
  let texture = [];

  fileLines.forEach(l => {
    switch (l.substr(0, 2)) {
      case 'v ':
        vertices.push(
          l
            .substr(2)
            .split(' ')
            .map(n => parseFloat(n))
        );
        break;
      case 'vt':
        texture.push(
          l
            .substr(3)
            .split(' ')
            .map(n => parseFloat(n))
        );
        break;
      case 'vn':
        normals.push(
          l
            .substr(3)
            .split(' ')
            .map(n => parseFloat(n))
        );
        break;
      case 'f ':
        faces.push(l.substr(2).split(' '));
        break;
      //case 'l ':
      //wireLines.push(l);
      //break;
    }
  });

  const geometry = {
    name,
    vertices: [],
    indices: [],
    barycentrics: [],
    texture: [],
    normals: [],
  };

  let indexCount = 0;
  faces.forEach(index => {
    index.forEach(v => {
      const idx = v.split('/').map(n => parseInt(n, 10));
      const vCoords = vertices[idx[0] - 1];
      vCoords.forEach(c => geometry.vertices.push(c));
      geometry.indices.push(indexCount);
      indexCount += 1;
      if (idx[1]) {
        const tCoords = texture[idx[1] - 1];
        tCoords.forEach(c => geometry.texture.push(c));
      }
      if (idx[2]) {
        const nCoords = normals[idx[2] - 1];
        nCoords.forEach(c => geometry.normals.push(c));
      }
    });
  });

  const r = removeCrossBar ? 1 : 0;
  const bnum = geometry.vertices.length / 3;
  for (let i = 0; i < bnum; i += 1) {
    if (i % 2) {
      // prettier-ignore
      geometry.barycentrics.push(
        0, r, 1,  1, 0, 0,  0, 1, 0
      );
    } else {
      // prettier-ignore
      geometry.barycentrics.push(
        0, r, 1,  0, 1, 0,  1, 0, 0,
      );
    }
  }

  return geometry;
}
