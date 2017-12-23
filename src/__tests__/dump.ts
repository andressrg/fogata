import * as _ from 'lodash';
import { Schema } from '../';
import * as fields from '../fields';

class MyAsyncField extends fields.Field {
  async load(input: any) {
    return await Promise.resolve(input);
  }

  async dump(input: any) {
    return await Promise.resolve(input);
  }
}

class ArtistSchema extends Schema {
  static artistName = new fields.StringField();
  static myAsyncAttr = new MyAsyncField();
}

class AlbumSchema extends Schema {
  static title = new fields.StringField();
  static release_date = new fields.DateField();
  static artist = new fields.NestedField(new ArtistSchema());
}

class Instancifier {
  constructor(data: any) {
    Object.getOwnPropertyNames(data).forEach(attr => {
      // @ts-ignore
      this[attr] = data[attr];
    });
  }
}

it('loads', async () => {
  expect(
    await new AlbumSchema().load({
      artist: { artistName: 'El Cuarteto De Nos', myAsyncAttr: 'something' },
      title: 'Habla Tu Espejo',
      release_date: '2014-10-06T18:51:17.749Z'
    })
  ).toMatchSnapshot();
});

it('dumps', async () => {
  expect(
    await new AlbumSchema().dump(
      new Instancifier({
        artist: new Instancifier({
          artistName: 'El Cuarteto De Nos',
          myAsyncAttr: 'something'
        }),
        title: 'Habla Tu Espejo',
        release_date: new Date('2014-10-06T18:51:17.749Z')
      })
    )
  ).toMatchSnapshot();
});

it('dumps only', async () => {
  expect(
    _.keys(
      await new AlbumSchema({ only: ['title', 'release_date'] }).dump(
        new Instancifier({
          artist: new Instancifier({
            artistName: 'El Cuarteto De Nos',
            myAsyncAttr: 'something'
          }),
          title: 'Habla Tu Espejo',
          release_date: new Date('2014-10-06T18:51:17.749Z')
        })
      )
    )
  ).toEqual(['title', 'release_date']);
});

it('dumps exclude', async () => {
  expect(
    _.keys(
      await new AlbumSchema({ exclude: ['title'] }).dump(
        new Instancifier({
          artist: new Instancifier({
            artistName: 'El Cuarteto De Nos',
            myAsyncAttr: 'something'
          }),
          title: 'Habla Tu Espejo',
          release_date: new Date('2014-10-06T18:51:17.749Z')
        })
      )
    )
  ).toEqual(['release_date', 'artist']);
});

it('dumps many', async () => {
  const result = await new AlbumSchema({ many: true }).dump(
    _.times(
      3,
      () =>
        new Instancifier({
          artist: new Instancifier({
            artistName: 'El Cuarteto De Nos',
            myAsyncAttr: 'something'
          }),
          title: 'Habla Tu Espejo',
          release_date: new Date('2014-10-06T18:51:17.749Z')
        })
    )
  );
  expect(result).toBeInstanceOf(Array);
  expect(result).toHaveLength(3);
  expect(result).toMatchSnapshot();
});
