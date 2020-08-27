const { isModelExists, findUid } = require("../src/services/Versioning");
const strapiObject = require("../../strapi-global-object/strapi-global");

describe("versioning test", () => {
  test("isModelExists: should return false if model doesn't exists in strapi object", () => {
    global.strapi = strapiObject;
    const ctx = {
      params: {
        id: 1,
      },
      url: "/content-manager/content-types/application::test.test",
    };

    global.strapi.models = {
      fake: {
        collectionName: "fakeModelCollectionName",
        uid: "fakeModelCollectionNameUid",
      },
    };
    expect(isModelExists(ctx)).toBe(false);
  });

  test("isModelExists: should return true if model exists in strapi object", () => {
    global.strapi = strapiObject;
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
    global.strapi = strapiObject;
    const ctx = {
      params: {
        id: 1,
      },
      url: "/tests/15",
    };

    global.strapi.models = {
      "application::test.test": {
        collectionName: "tests",
        uid: "test",
      },
    };
    expect(findUid(ctx)).toBe("test");
  });

  test("findUid: should return proper uid for proper strapi structure and ctx url", () => {
    global.strapi = strapiObject;
    const ctx = {
      params: {
        id: 1,
        model: "tests",
      },
      url: "/test/15",
    };

    global.strapi.models = {
      "application::test.test": {
        collectionName: "tests",
        uid: "test",
      },
    };

    global.strapi.db = {
      getModel: jest.fn(),
    };
    global.strapi.db.getModel.mockReturnValueOnce({ uid: "mocked" });
    findUid(ctx);
    expect(global.strapi.db.getModel).toHaveBeenCalled();
  });
});
