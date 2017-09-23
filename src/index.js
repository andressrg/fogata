const fields = require('./fields');
const { ValidationError } = require('./errors');

class Schema {
  constructor(params = {}) {
    this.only = params.only;
    this.exclude = params.exclude;
    this.many = params.many;
  }

  _checkExcludeAndOnly(attr) {
    if (this.exclude !== undefined) {
      return !this.exclude.includes(attr);
    }

    if (this.only !== undefined) {
      return this.only.includes(attr);
    }

    return true;
  }

  _getSyncFields() {
    return Object.getOwnPropertyNames(this.constructor).filter(
      attr =>
        this.constructor[attr] instanceof fields.Field &&
        this._checkExcludeAndOnly(attr)
    );
  }

  _getAsyncFields() {
    return Object.getOwnPropertyNames(this.constructor).filter(
      attr =>
        this.constructor[attr] instanceof fields.AsyncField &&
        this._checkExcludeAndOnly(attr)
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

  async _dumpOne(data) {
    const result = this.dumpSync(data);
    for (const field of this._getAsyncFields()) {
      result[field] = await this.constructor[field].dump(data[field]);
    }
    return result;
  }

  async dump(data) {
    if (this.many === true) {
      return await Promise.all(data.map(one => this._dumpOne(one)));
    }
    return await this._dumpOne(data);
  }
}

module.exports = { Schema, fields, ValidationError };
