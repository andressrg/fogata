const { Schema, fields } = require('../');

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
    return new fields.Str();
  }
  static get myAsyncAttr() {
    return new MyAsyncField();
  }
}

class AlbumSchema extends Schema {
  static get title() {
    return new fields.Str();
  }

  static get release_date() {
    return new fields.DateField();
  }

  static get artist() {
    return new fields.Nested(new ArtistSchema());
  }
}

class AsyncAlbumSchema extends Schema {
  static get title() {
    return new fields.Str();
  }

  static get release_date() {
    return new fields.DateField();
  }

  static get artist() {
    return new fields.AsyncNested(new ArtistSchema());
  }
}

it('loads sync', async () => {
  expect(
    new AlbumSchema().loadSync({
      artist: { name: 'El Cuarteto De Nos', myAsyncAttr: 'something' },
      title: 'Habla Tu Espejo',
      release_date: '2014-10-06T18:51:17.749Z'
    })
  ).toMatchSnapshot();
});

it('loads', async () => {
  expect(
    await new AsyncAlbumSchema().load({
      artist: { name: 'El Cuarteto De Nos', myAsyncAttr: 'something' },
      title: 'Habla Tu Espejo',
      release_date: '2014-10-06T18:51:17.749Z'
    })
  ).toMatchSnapshot();
});

it('dumps sync', async () => {
  class Objectifier {
    constructor(data) {
      Object.getOwnPropertyNames(data).forEach(
        attr => (this[attr] = data[attr])
      );
    }
  }

  expect(
    new AlbumSchema().dumpSync(
      new Objectifier({
        artist: new Objectifier({
          name: 'El Cuarteto De Nos',
          myAsyncAttr: 'something'
        }),
        title: 'Habla Tu Espejo',
        release_date: new Date('2014-10-06T18:51:17.749Z')
      })
    )
  ).toMatchSnapshot();
});

it('dumps', async () => {
  class Objectifier {
    constructor(data) {
      Object.getOwnPropertyNames(data).forEach(
        attr => (this[attr] = data[attr])
      );
    }
  }

  expect(
    await new AsyncAlbumSchema().dump(
      new Objectifier({
        artist: new Objectifier({
          name: 'El Cuarteto De Nos',
          myAsyncAttr: 'something'
        }),
        title: 'Habla Tu Espejo',
        release_date: new Date('2014-10-06T18:51:17.749Z')
      })
    )
  ).toMatchSnapshot();
});
