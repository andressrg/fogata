class ValidationError extends Error {
  constructor(params) {
    super(...arguments);

    if (params instanceof String) {
      this.message = params;
    } else if (params.messages !== undefined) {
      this.messages = params.messages;
    }
  }

  toString() {
    if (this.message) return this.message;
    super.toString();
  }
}

module.exports = { ValidationError };
