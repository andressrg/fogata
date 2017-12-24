import * as importedFields from './fields';
import { ValidationError } from './errors';

export const fields = { ...importedFields };

export class Schema {
  only: string[];
  exclude: string[];
  many: boolean;

  constructor(
    params: { only?: string[]; exclude?: string[]; many?: boolean } = {}
  ) {
    this.only = params.only || [];
    this.exclude = params.exclude || [];
    this.many = params.many || false;
  }

  _checkExcludeAndOnly(attr: string) {
    if (this.exclude.length > 0) {
      return this.exclude.indexOf(attr) === -1;
    }

    if (this.only.length > 0) {
      return this.only.indexOf(attr) !== -1;
    }

    return true;
  }

  _getFields(): string[] {
    return Object.getOwnPropertyNames(this.constructor).filter(
      attr =>
        this._getField(attr) instanceof importedFields.Field &&
        this._checkExcludeAndOnly(attr)
    );
  }

  _getField(name: string): importedFields.Field {
    // @ts-ignore
    return (this.constructor as { [propName: string]: importedFields.Field })[
      name
    ];
  }

  async load(data: any) {
    const result: { [propName: string]: any } = {};
    const errors: { [propName: string]: string[] } = {};
    for (const field of this._getFields()) {
      try {
        result[field] = await this._getField(field).load(data[field]);
      } catch (err) {
        errors[field] = [...(errors[field] || []), err.toString()];
      }
    }

    if (Object.getOwnPropertyNames(errors).length > 0) {
      throw new ValidationError({ messages: errors });
    }

    return result;
  }

  async _dumpOne(data: any) {
    const result: { [propName: string]: any } = {};
    for (const field of this._getFields()) {
      result[field] = await this._getField(field).dump(data[field]);
    }
    return result;
  }

  async dump(data: any) {
    if (this.many === true) {
      return await Promise.all((data as any[]).map(one => this._dumpOne(one)));
    }
    return await this._dumpOne(data);
  }
}
