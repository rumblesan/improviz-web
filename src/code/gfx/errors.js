export class GFXError extends Error {
  constructor(message) {
    super(message);
  }
}

export class ShaderError extends GFXError {
  constructor(name, message) {
    super(`Shader Error - ${name} shader: ${message}`);
  }
}

export class MaterialError extends GFXError {
  constructor(name, message) {
    super(`Material Error - ${name} material: ${message}`);
  }
}

export class PostProcessingError extends GFXError {
  constructor(name, message) {
    super(`PostProcessing Error - ${name} stage: ${message}`);
  }
}
