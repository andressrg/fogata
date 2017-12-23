export class ValidationError extends Error {
  messages?: string[] | { [propName: string]: string[] };

  constructor(
    params: string | string[] | { messages: { [propName: string]: string[] } }
  ) {
    super(...arguments);

    if (params instanceof String) {
      this.message = params;
    } else if (params instanceof Array) {
      this.messages = params;
    } else if (params.messages !== undefined) {
      this.messages = params.messages;
    }
  }

  toString() {
    if (this.message) return this.message;
    super.toString();
  }
}
