const { Schema, fields, ValidationError } = require('../');

class MyAsyncField extends fields.Field {
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
    return new fields.NestedField(new ArtistSchema());
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

    static get name() {
      return new fields.StringField({ required: true });
    }
  }

  const resultPromise = new UserSchema().load({
    email: 'foo'
  });
  await expect(resultPromise).rejects.toBeInstanceOf(ValidationError);

  try {
    await new UserSchema().load({
      email: 'foo'
    });
  } catch (err) {
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.messages).toEqual({
      email: ['foo is not a valid email address.'],
      name: ['Required value.']
    });
  }

  await expect(new UserSchema().load({})).rejects.toBeInstanceOf(
    ValidationError
  );
});
