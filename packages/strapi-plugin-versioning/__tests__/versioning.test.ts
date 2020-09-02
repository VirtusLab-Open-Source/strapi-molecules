const { isModelExists, findUid, getModelFromCtx } = require("../src/services/Versioning");
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
      .addModels([{
        fake: {
          collectionName: "fakeModelCollectionName",
          uid: "fakeModelCollectionNameUid",
        },
      }])
      .build();
    expect(isModelExists(ctx)).toBe(false);
  });

  test("isModelExists: should return true if model exists in strapi object", () => {
    global.strapi = new StrapiBuilder2()
      .addModels([{
        fake: {
          collectionName: "fakes",
          uid: "fakes",
        },
      }])
      .build();
    const ctx = {
      params: {
        id: 1,
        model: "fakes",
      },
      url: "/content-manager/content-types/application::test.test",
    };
    const model = getModelFromCtx(ctx)
    expect(isModelExists(model)).toBe(true);
  });

  test("findUid: should return proper uid for proper strapi structure and ctx url", () => {
    global.strapi = new StrapiBuilder2()
      .addModels([{
        "application::test.test": {
          collectionName: "tests",
          uid: "test",
        },
      }])
      .build();

    const ctx = {
      params: {
        id: 1,
      },
      url: "/tests/15",
    };


    expect(findUid(ctx)).toBe("test");
  });

  test("findUid: trigger getModel function", () => {
    global.strapi = new StrapiBuilder2()
      .addModels([{
        "application::test.test": {
          collectionName: "tests",
          uid: "test",
        },
      }])
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
