const { ValidationError } = require('./errors');

class BaseField {
  constructor(params = {}) {
    this.required = params.required !== undefined && !!params.required;
  }

  load(input) {
    if (this.required && input === undefined) {
      throw new ValidationError('Required value');
    }

    return input;
  }

  dump(input) {
    return input;
  }
}

class Field extends BaseField {}

class AsyncField extends BaseField {}

class StringField extends Field {
  load(input) {
    input = super.load(...arguments);
    return `${input}`;
  }

  dump(input) {
    input = super.dump(...arguments);
    return this.load(input);
  }
}

class DateField extends Field {
  load(input) {
    input = super.load(...arguments);
    return new Date(input);
  }

  dump(input) {
    input = super.dump(...arguments);
    return input.toISOString();
  }
}

class EmailField extends Field {
  load(input) {
    input = super.load(...arguments);
    if (input === undefined) return;
    if (!input.includes('@')) {
      throw new ValidationError('Invalid email.');
    }
    return input;
  }

  dump(input) {
    input = super.dump(...arguments);
    return input;
  }
}

class NestedField extends Field {
  constructor(nestedSchema) {
    super(...arguments);
    this.nestedSchema = nestedSchema;
  }

  load(input) {
    input = super.load(...arguments);
    return this.nestedSchema.loadSync(input);
  }

  dump(input) {
    input = super.dump(...arguments);
    return this.nestedSchema.dumpSync(input);
  }
}

class AsyncNestedField extends AsyncField {
  constructor(nestedSchema) {
    super(...arguments);
    this.nestedSchema = nestedSchema;
  }

  load(input) {
    input = super.load(...arguments);
    return this.nestedSchema.load(input);
  }

  dump(input) {
    input = super.dump(...arguments);
    return this.nestedSchema.dump(input);
  }
}

module.exports = {
  Field,
  AsyncField,
  StringField,
  NestedField,
  AsyncNestedField,
  DateField,
  EmailField
};
