import { MaterialError } from '../errors';
import { compileShaderProgram } from '../shaders';

import { material as basic } from './basic.yaml';
import { material as weird } from './weird.yaml';
import { material as texture } from './texture.yaml';
import { material as bordered } from './bordered.yaml';
import { material as normalised } from './normalised.yaml';

export function loadAllMaterials(gl) {
  const errors = [];
  const materials = {};

  [basic, weird, texture, bordered, normalised].forEach(m => {
    try {
      const loaded = loadMaterial(gl, m);
      materials[loaded.name] = loaded;
    } catch (e) {
      errors.push(e);
    }
  });

  return {
    errors,
    materials,
  };
}

export function loadMaterial(gl, material) {
  const program = compileShaderProgram(
    gl,
    material.name,
    material.vertexShader,
    material.fragmentShader
  );

  const attributeLocations = {};
  material.attributes.forEach(aName => {
    const attrib = gl.getAttribLocation(program, aName);
    if (attrib === null) {
      // TODO include gl.getError info
      throw new MaterialError(
        material.name,
        `WebGL could not get ${aName} attribute.`
      );
    }
    attributeLocations[aName] = attrib;
  });

  const uniformLocations = {};
  material.uniforms.forEach(uName => {
    const uniform = gl.getUniformLocation(program, uName);
    if (uniform === null) {
      // TODO include gl.getError info
      throw new MaterialError(
        material.name,
        `WebGL could not get ${uName} uniform.`
      );
    }
    uniformLocations[uName] = uniform;
  });

  return {
    name: material.name,
    program,
    attributes: attributeLocations,
    uniforms: uniformLocations,
  };
}
