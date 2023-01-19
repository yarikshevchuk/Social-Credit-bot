class ErrorApi extends Error {
  constructor(message) {
    super();
    this.message = message;
  }

  static userError(message) {
    return new ErrorApi(message);
  }

  static chatError(message) {
    return new ErrorApi(message);
  }

  static forbidden(message) {
    return new ErrorApi(message);
  }
}

module.exports = ErrorApi;
