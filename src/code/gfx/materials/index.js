import { MaterialError } from '../errors';
import { compileShaderProgram } from '../shaders';


export function loadMaterialYAML(gl, material) {
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
