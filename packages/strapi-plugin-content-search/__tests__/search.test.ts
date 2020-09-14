const { search } = require("../src/controllers/Search");
const { StrapiBuilder } = require("strapi-builder");

describe("content search test", () => {
  const fetchAsyncData = jest.fn();

  test("search: should trigger fetchAsyncData function with [searchableComponent] and first string arguments", async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
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

    await search({ request: { body: { _q: "first" } }, is: () => false });
    expect(fetchAsyncData).toBeCalledWith(["searchableComponent"], "first");
  });

  test("search: should trigger fetchAsyncData function with  [searchableComponent, secondSearchableComponent,thirdSearchableComponent] and second string arguments", async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
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

    await search({ request: { body: { _q: "second" } }, is: () => false });
    expect(fetchAsyncData).toBeCalledWith(
      [
        "searchableComponent",
        "secondSearchableComponent",
        "thirdSearchableComponent",
      ],
      "second",
    );
  });

  test("search: should trigger fetchAsyncData function with [] and third string arguments", async () => {
    global.strapi = new StrapiBuilder()
      .addPlugins({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
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
    await search({ request: { body: { _q: "third" } }, is: () => false });
    expect(fetchAsyncData).toBeCalledWith([], "third");
  });
});

export {};
