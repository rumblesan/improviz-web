import { GFXError } from './errors';

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
      throw new GFXError(`WebGL could not get ${aName} attribute location`);
    }
    attributeLocations[aName] = attrib;
  });

  const uniformLocations = {};
  material.uniforms.forEach(uName => {
    const uniform = gl.getUniformLocation(program, uName);
    if (uniform === null) {
      // TODO include gl.getError info
      throw new GFXError(`WebGL could not get ${uName} uniform location`);
    }
    uniformLocations[uName] = uniform;
  });

  return {
    program,
    attributes: attributeLocations,
    uniforms: uniformLocations,
  };
}

export function compileShaderProgram(gl, vc, fc) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  if (vertShader === null) {
    throw new GFXError('WebGL could not create vertex shader');
  }
  gl.shaderSource(vertShader, vc);
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    throw new GFXError(
      `Could not compile vertex shader: ${gl.getShaderInfoLog(vertShader)}`
    );
  }

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (fragShader === null) {
    throw new GFXError('WebGL could not create fragment shader');
  }
  gl.shaderSource(fragShader, fc);
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    throw new GFXError(
      `Could not compile fragment shader: ${gl.getShaderInfoLog(fragShader)}`
    );
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new GFXError(
      `Could not compile shader program: ${gl.getShaderInfoLog(program)}`
    );
  }

  return program;
}
