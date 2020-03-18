import { GFXError } from '../errors';
import { compileShaderProgram } from '../shaders';

export function loadMaterial(gl, material) {
  const program = compileShaderProgram(
    gl,
    material.vertexShader,
    material.fragmentShader
  );

  const attributeLocations = {};
  material.attributes.forEach(aName => {
    const attrib = gl.getAttribLocation(program, aName);
    if (attrib === null) {
      // TODO include gl.getError info
      throw new GFXError(
        `Error loading ${material.name} material: WebGL could not get ${aName} attribute.`
      );
    }
    attributeLocations[aName] = attrib;
  });

  const uniformLocations = {};
  material.uniforms.forEach(uName => {
    const uniform = gl.getUniformLocation(program, uName);
    if (uniform === null) {
      // TODO include gl.getError info
      throw new GFXError(
        `Error loading ${material.name} material: WebGL could not get ${uniform} uniform.`
      );
    }
    uniformLocations[uName] = uniform;
  });

  return {
    program,
    attributes: attributeLocations,
    uniforms: uniformLocations,
  };
}
