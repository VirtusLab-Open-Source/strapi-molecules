import {
  Strapi,
  Plugin,
  Model,
  ComponentModel,
  ContentType,
} from "strapi-types";

export class StrapiBuilder {
  strapi = new Strapi();
  addContentTypes = (contentTypes: Array<{ [key: string]: ContentType }>) => {
    contentTypes.forEach((el) => {
      this.strapi = {
        ...this.strapi,
        contentTypes: {
          ...this.strapi.contentTypes,
          ...el,
        },
      };
    });
    return this;
  };

  addModels = (models: Array<{ [key: string]: Model }>) => {
    models.forEach((el) => {
      this.strapi = {
        ...this.strapi,
        models: {
          ...this.strapi.models,
          ...el,
        },
      };
    });
    return this;
  };

  addComponents = (components: Array<{ [key: string]: ComponentModel }>) => {
    components.forEach((el) => {
      this.strapi = {
        ...this.strapi,
        components: {
          ...this.strapi.components,
          ...el,
        },
      };
    });
    return this;
  };

  addPlugins = (plugins: Array<{ [key: string]: Plugin }>) => {
    plugins.forEach((el) => {
      this.strapi = {
        ...this.strapi,
        plugins: {
          ...this.strapi.plugins,
          ...el,
        },
      };
    });
    return this;
  };

  build = () => this.strapi;
}
