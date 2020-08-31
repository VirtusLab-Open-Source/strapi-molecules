const { search } = require("../src/controllers/Search");
const { StrapiBuilder: StrapiBuilder1 } = require("strapi-builder");

describe("content search test", () => {
  const fetchAsyncData = jest.fn();

  test("search: should trigger fetchAsyncData function with [searchableComponent] and first string arguments", async () => {
    global.strapi = new StrapiBuilder1()
      .addPlugin({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
      .addContentType({
        searchableComponent: {
          options: {
            searchable: true,
          },
        },
      })
      .addContentType({
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
    global.strapi = new StrapiBuilder1()
      .addPlugin({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
      .addContentType({
        searchableComponent: {
          options: {
            searchable: true,
          },
        },
      })
      .addContentType({
        secondSearchableComponent: {
          options: {
            searchable: true,
          },
        },
      })
      .addContentType({
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
    global.strapi = new StrapiBuilder1()
      .addPlugin({
        "content-search": {
          services: {
            searchabledata: {
              fetchAsyncData,
            },
          },
        },
      })
      .addContentType({
        searchableComponent: {
          options: {
            searchable: false,
          },
        },
      })
      .addContentType({
        secondSearchableComponent: {
          options: {
            searchable: false,
          },
        },
      })
      .build();

    global.strapi.contentTypes = {
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
    };
    await search({ request: { body: { _q: "third" } }, is: () => false });
    expect(fetchAsyncData).toBeCalledWith([], "third");
  });
});
