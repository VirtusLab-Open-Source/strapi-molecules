import { Strapi, Plugin, Model, ComponentModel } from "strapi-types";

export class StrapiBuilder {
  strapi = new Strapi();
  addContentType = (contentType: { [key: string]: any }) => {
    this.strapi = {
      ...this.strapi,
      contentTypes: {
        ...this.strapi.contentTypes,
        ...contentType,
      },
    };
    return this;
  };

  addModel = (model: { [key: string]: Model }) => {
    this.strapi = {
      ...this.strapi,
      models: {
        ...this.strapi.models,
        ...model,
      },
    };
    return this;
  };

  addComponent = (component: { [key: string]: ComponentModel }) => {
    this.strapi = {
      ...this.strapi,
      components: {
        ...this.strapi.components,
        ...component,
      },
    };
    return this;
  };

  addPlugin = (plugin: { [key: string]: Plugin }) => {
    this.strapi = {
      ...this.strapi,
      plugins: {
        ...this.strapi.plugins,
        ...plugin,
      },
    };
    return this;
  };

  build = () => this.strapi;
}
