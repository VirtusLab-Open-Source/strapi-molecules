const { search } = require('../src/controllers/Search');
const { StrapiBuilder } = require('strapi-builder');

describe('content search test', () => {
  const searchContentTypes = jest.fn();

  test('search: should trigger fetchData function with [searchableComponent] and first string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              searchContentTypes,
            },
          },
        },
      })
      .addPluginConfig({ 'content-search': {} })
      .addContentTypes({
        searchableComponent: {
          options: {
            searchable: true,
          },
        },
        nonSearchableComponent: {
          options: {
            searchable: false,
          },
        },
      })
      .build();

    await search({ query: { _q: 'first' } });
    expect(searchContentTypes).toBeCalledWith(['searchableComponent'], {
      _q: 'first',
    });
  });

  test('search: should trigger fetchData function with  [searchableComponent, secondSearchableComponent,thirdSearchableComponent] and second string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              searchContentTypes,
            },
          },
        },
      })
      .addPluginConfig({ 'content-search': {} })
      .addContentTypes({
        searchableComponent: {
          options: {
            searchable: true,
          },
        },
        secondSearchableComponent: {
          options: {
            searchable: true,
          },
        },
        thirdSearchableComponent: {
          options: {
            searchable: true,
          },
        },
      })
      .build();

    await search({ query: { _q: 'second' } });
    expect(searchContentTypes).toBeCalledWith(
      [
        'searchableComponent',
        'secondSearchableComponent',
        'thirdSearchableComponent',
      ],
      { _q: 'second' },
    );
  });

  test('search: should trigger fetchData function with [] and third string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              searchContentTypes,
            },
          },
        },
      })
      .addPluginConfig({ 'content-search': {} })
      .addContentTypes({
        searchableComponent: {
          options: {
            searchable: false,
          },
        },
        secondSearchableComponent: {
          options: {
            searchable: false,
          },
        },
      })
      .build();
    await search({ query: { _q: 'third' } });
    expect(searchContentTypes).toBeCalledWith([], { _q: 'third' });
  });
});

export {};
