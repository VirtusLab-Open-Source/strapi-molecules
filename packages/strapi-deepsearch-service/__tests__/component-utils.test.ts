import { StrapiBuilder } from 'strapi-builder';
import { StrapiGlobalComponents } from 'strapi-types';

const {
  isModelComponent,
  isModelComponentSearchable,
  getComponentByModel,
} = require('../src/services/utils/component-utils');

describe('Test Deep search component utils functions', () => {
  global.strapi = new StrapiBuilder()
    .addComponents(({
      'group1.component1': {
        allAttributes: {},
        options: {
          searchable: true,
        },
      },
      'group2.component1': {
        allAttributes: {},
        options: {
          searchable: false,
        },
      },
    } as any) as StrapiGlobalComponents)
    .build();

  const contentTypeModel = {
    allAttributes: {
      searchableComponent: {
        type: "component",
        repeatable: false,
        component: "group1.component1",
      },
      nonSearchableComponent: {
        type: "component",
        repeatable: false,
        component: "group2.component1",
      },
    },
  };

  test("isModelComponent: Should return true if model is a component", () => {
    expect(isModelComponent(contentTypeModel, "searchableComponent")).toBe(
      true,
    );

    expect(isModelComponent(contentTypeModel, "nonExistingComponent")).toBe(
      false,
    );
  });

  test("isModelComponentSearchable: Should return true if model is a searchable component", () => {
    expect(
      isModelComponentSearchable(contentTypeModel, "searchableComponent"),
    ).toBe(true);

    expect(
      isModelComponentSearchable(contentTypeModel, "nonSearchableComponent"),
    ).toBe(false);

    expect(
      isModelComponentSearchable(contentTypeModel, "nonExistingComponent"),
    ).toBe(false);
  });

  test("getComponentByModel: Should return model if existing", () => {
    expect(
      getComponentByModel(contentTypeModel, "searchableComponent"),
    ).toEqual({
      allAttributes: {},
      options: {
        searchable: true,
      },
    });
    expect(getComponentByModel(contentTypeModel, "nonExistingComponent")).toBe(
      undefined,
    );
  });
});

export {};
