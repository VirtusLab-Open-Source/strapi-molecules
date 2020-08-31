const { isModelExists, findUid } = require("../src/services/Versioning");
const { StrapiBuilder: StrapiBuilder2 } = require("strapi-builder");

describe("versioning test", () => {
  const ctx = {
    params: {
      id: 1,
    },
    url: "/content-manager/content-types/application::test.test",
  };
  test("isModelExists: should return false if model doesn't exists in strapi object", () => {
    global.strapi = new StrapiBuilder2()
      .addModel({
        fake: {
          collectionName: "fakeModelCollectionName",
          uid: "fakeModelCollectionNameUid",
        },
      })
      .build();
    expect(isModelExists(ctx)).toBe(false);
  });

  test("isModelExists: should return true if model exists in strapi object", () => {
    global.strapi = new StrapiBuilder2()
      .addModel({
        fake: {
          collectionName: "fakeModelCollectionName",
          uid: "fakeModelCollectionNameUid",
        },
      })
      .build();
    const ctx = {
      params: {
        id: 1,
        model: "fake",
      },
      url: "/content-manager/content-types/application::test.test",
    };
    expect(isModelExists(ctx)).toBe(true);
  });

  test("findUid: should return proper uid for proper strapi structure and ctx url", () => {
    global.strapi = new StrapiBuilder2()
      .addModel({
        "application::test.test": {
          collectionName: "tests",
          uid: "test",
        },
      })
      .build();
    const ctx = {
      params: {
        id: 1,
      },
      url: "/tests/15",
    };

    expect(findUid(ctx)).toBe("test");
  });

  test("findUid: should return proper uid for proper strapi structure and ctx url", () => {
    global.strapi = new StrapiBuilder2()
      .addModel({
        "application::test.test": {
          collectionName: "tests",
          uid: "test",
        },
      })
      .build();

    const ctx = {
      params: {
        id: 1,
        model: "tests",
      },
      url: "/test/15",
    };

    global.strapi.db.getModel = jest.fn();
    global.strapi.db.getModel.mockReturnValueOnce({ uid: "mocked" });
    findUid(ctx);
    expect(global.strapi.db.getModel).toHaveBeenCalled();
  });
});
