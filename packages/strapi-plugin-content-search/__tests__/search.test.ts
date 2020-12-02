const { search } = require('../src/controllers/Search');
const { StrapiBuilder } = require('strapi-builder');

describe('content search test', () => {
  const fetchAsyncData = jest.fn();

  test('search: should trigger fetchAsyncData function with [searchableComponent] and first string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              fetchAsyncData,
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
    expect(fetchAsyncData).toBeCalledWith(['searchableComponent'], {
      _q: 'first',
    });
  });

  test('search: should trigger fetchAsyncData function with  [searchableComponent, secondSearchableComponent,thirdSearchableComponent] and second string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              fetchAsyncData,
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
    expect(fetchAsyncData).toBeCalledWith(
      [
        'searchableComponent',
        'secondSearchableComponent',
        'thirdSearchableComponent',
      ],
      { _q: 'second' },
    );
  });

  test('search: should trigger fetchAsyncData function with [] and third string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              fetchAsyncData,
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
    expect(fetchAsyncData).toBeCalledWith([], { _q: 'third' });
  });
});

export {};
