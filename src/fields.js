const { ValidationError } = require('./errors');

class Validator {
  validate() {}
}

class RequiredValidator extends Validator {
  validate(value) {
    super.validate(...arguments);
    if (value === null || value === undefined) {
      throw new ValidationError('Required value.');
    }
  }
}

class Field {
  constructor(params = {}) {
    this.validators = params.validators || [];

    this.required = params.required;
    if (this.required === true) {
      this.validators = [...this.validators, new RequiredValidator()];
    }
  }

  load(input) {
    const errors = this.validators
      .map(validator => {
        try {
          validator.validate(input);
        } catch (err) {
          return err.toString();
        }
      })
      .filter(e => !!e);

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return input;
  }

  dump(input) {
    return input;
  }
}

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

class EmailValidator extends Validator {
  validate(value) {
    super.validate(...arguments);

    if (value !== undefined && !value.includes('@')) {
      throw new ValidationError(`${value} is not a valid email address.`);
    }
  }
}

class EmailField extends Field {
  constructor() {
    super();
    this.validators = [...this.validators, new EmailValidator()];
  }
}

class NestedField extends Field {
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
  StringField,
  NestedField,
  DateField,
  EmailField
};
