import {
  Strapi,
  Plugin,
  Model,
  ComponentModel,
  ContentType,
  StrapiGlobal,
} from "strapi-types";

export class StrapiBuilder {
  strapi = new Strapi();
  query: () => any;
  db: any;

  constructor(params: { query: () => any; db: any }) {
    this.query = params.query;
    this.db = params.db;
  }

  addContentTypes = (contentTypes: { [key: string]: ContentType }) => {
    this.strapi = {
      ...this.strapi,
      contentTypes: {
        ...this.strapi.contentTypes,
        ...contentTypes,
      },
    };
    return this;
  };

  addModels = (models: { [key: string]: Model }) => {
    this.strapi = {
      ...this.strapi,
      models: {
        ...this.strapi.models,
        ...models,
      },
    };
    return this;
  };

  addComponents = (components: { [key: string]: ComponentModel }) => {
    this.strapi = {
      ...this.strapi,
      components: {
        ...this.strapi.components,
        ...components,
      },
    };
    return this;
  };

  addPlugins = (plugins: { [key: string]: Plugin }) => {
    this.strapi = {
      ...this.strapi,
      plugins: {
        ...this.strapi.plugins,
        ...plugins,
      },
    };
    return this;
  };

  build = (): StrapiGlobal => ({
    ...this.strapi,
    query: this.query,
    db: this.db,
  });
}
