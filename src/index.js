class Schema {
  _getSyncFields() {
    return Object.getOwnPropertyNames(this.constructor).filter(
      attr => this.constructor[attr] instanceof Field
    );
  }

  _getAsyncFields() {
    return Object.getOwnPropertyNames(this.constructor).filter(
      attr => this.constructor[attr] instanceof AsyncField
    );
  }

  loadSync(data) {
    return this._getSyncFields().reduce((result, field) => {
      result[field] = this.constructor[field].load(data[field]);
      return result;
    }, {});
  }

  async load(data) {
    const result = this.loadSync(data);
    for (const field of this._getAsyncFields()) {
      result[field] = await this.constructor[field].load(data[field]);
    }
    return result;
  }

  dumpSync(data) {
    return this._getSyncFields().reduce((result, field) => {
      result[field] = this.constructor[field].dump(data[field]);
      return result;
    }, {});
  }

  async dump(data) {
    const result = this.dumpSync(data);
    for (const field of this._getAsyncFields()) {
      result[field] = await this.constructor[field].dump(data[field]);
    }
    return result;
  }
}

class BaseField {}

class Field extends BaseField {}

class AsyncField extends BaseField {}

class Str extends Field {
  load(input) {
    return `${input}`;
  }

  dump(input) {
    return this.load(input);
  }
}

class DateField extends Field {
  load(input) {
    return new Date(input);
  }

  dump(input) {
    return input.toISOString();
  }
}

class Nested extends Field {
  constructor(nestedSchema) {
    super(...arguments);
    this.nestedSchema = nestedSchema;
  }

  load(input) {
    return this.nestedSchema.loadSync(input);
  }

  dump(input) {
    return this.nestedSchema.dumpSync(input);
  }
}

class AsyncNested extends AsyncField {
  constructor(nestedSchema) {
    super(...arguments);
    this.nestedSchema = nestedSchema;
  }

  load(input) {
    return this.nestedSchema.load(input);
  }

  dump(input) {
    return this.nestedSchema.dump(input);
  }
}

const fields = { Field, AsyncField, Str, Nested, AsyncNested, DateField };

module.exports = { Schema, fields };
