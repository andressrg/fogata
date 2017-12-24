import { ValidationError } from './errors';
import { Schema } from './index';

export class Validator implements Validator {
  validate(value: any) {}
}

class RequiredValidator extends Validator {
  validate(value: any) {
    super.validate(value);
    if (value === null || value === undefined) {
      throw new ValidationError('Required value.');
    }
  }
}

export interface FieldParams {
  validators?: Array<Validator>;
  required?: boolean;
}

export class Field {
  validators: Validator[];
  required: boolean;

  constructor(params: FieldParams = {}) {
    this.validators = params.validators || [];

    this.required = params.required || false;
    if (this.required === true) {
      this.validators = [...this.validators, new RequiredValidator()];
    }
  }

  load(input: any): any {
    const errors: string[] = this.validators
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

  dump(input: any): any {
    return input;
  }
}

export class StringField extends Field {
  load(input: any): string {
    input = super.load(input);
    return `${input}`;
  }
}

export class DateField extends Field {
  load(input: any): Date {
    input = super.load(input);
    return new Date(input);
  }

  dump(input: Date): string {
    input = super.dump(input);
    return input.toISOString();
  }
}

export class EmailValidator extends Validator {
  validate(value: string) {
    super.validate(value);

    if (value !== undefined && !value.includes('@')) {
      throw new ValidationError(`${value} is not a valid email address.`);
    }
  }
}

export class EmailField extends Field {
  constructor(params: FieldParams = {}) {
    super(params);
    this.validators = [...this.validators, new EmailValidator()];
  }
}

export class NestedField extends Field {
  nestedSchema: Schema;

  constructor(nestedSchema: Schema) {
    super(...arguments);
    this.nestedSchema = nestedSchema;
  }

  load(input: any): any {
    input = super.load(input);
    return this.nestedSchema.load(input);
  }

  dump(input: any) {
    input = super.dump(input);
    return this.nestedSchema.dump(input);
  }
}
