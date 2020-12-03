const { search } = require('../src/controllers/Search');
const { StrapiBuilder } = require('strapi-builder');

describe('content search test', () => {
  const fetchData = jest.fn();

  test('search: should trigger fetchData function with [searchableComponent] and first string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              fetchData,
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
    expect(fetchData).toBeCalledWith(['searchableComponent'], {
      _q: 'first',
    });
  });

  test('search: should trigger fetchData function with  [searchableComponent, secondSearchableComponent,thirdSearchableComponent] and second string arguments', async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        'content-search': {
          services: {
            searchabledata: {
              fetchData,
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
    expect(fetchData).toBeCalledWith(
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
              fetchData,
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
    expect(fetchData).toBeCalledWith([], { _q: 'third' });
  });
});

export {};
