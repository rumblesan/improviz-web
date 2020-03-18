export class GFXError extends Error {
  constructor(message) {
    super(message);
  }
}

export class PostProcessingError extends GFXError {
  constructor(stage, message) {
    super(`PostProcessing Error - ${stage}: ${message}`);
  }
}
