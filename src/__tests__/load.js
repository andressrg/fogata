const { Schema, fields, ValidationError } = require('../');

class MyAsyncField extends fields.AsyncField {
  async load(input) {
    return await Promise.resolve(input);
  }

  async dump(input) {
    return await Promise.resolve(input);
  }
}

class ArtistSchema extends Schema {
  static get name() {
    return new fields.StringField();
  }
  static get myAsyncAttr() {
    return new MyAsyncField();
  }
}

class AlbumSchema extends Schema {
  static get title() {
    return new fields.StringField();
  }

  static get release_date() {
    return new fields.DateField();
  }

  static get artist() {
    return new fields.AsyncNestedField(new ArtistSchema());
  }
}

it('loads', async () => {
  expect(
    await new AlbumSchema().load({
      artist: { name: 'El Cuarteto De Nos', myAsyncAttr: 'something' },
      title: 'Habla Tu Espejo',
      release_date: '2014-10-06T18:51:17.749Z'
    })
  ).toMatchSnapshot();
});

it('validation throws', async () => {
  class UserSchema extends Schema {
    static get email() {
      return new fields.EmailField({ required: true });
    }
  }

  await expect(
    new UserSchema().load({
      email: 'invalid'
    })
  ).rejects.toBeInstanceOf(ValidationError);

  await expect(new UserSchema().load({})).rejects.toBeInstanceOf(
    ValidationError
  );
});
