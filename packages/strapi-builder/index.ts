import {
  Strapi,
  StrapiGlobalAdmin,
  StrapiGlobalApp,
  StrapiGlobalComponents,
  StrapiGlobalConfig,
  StrapiGlobalConnections,
  StrapiGlobalContentTypes,
  StrapiGlobalDB,
  StrapiGlobalModels,
  StrapiGlobalPlugins,
  StrapiGlobalQuery,
} from 'strapi-types';

export class StrapiBuilder {
  strapi = new Strapi();

  addContentTypes = (contentTypes: StrapiGlobalContentTypes) => {
    this.strapi.contentTypes = {
      ...this.strapi.contentTypes,
      ...contentTypes,
    };
    return this;
  };

  addModels = (models: StrapiGlobalModels) => {
    this.strapi.models = {
      ...this.strapi.models,
      ...models,
    };
    return this;
  };

  addComponents = (components: StrapiGlobalComponents) => {
    this.strapi.components = {
      ...this.strapi.components,
      ...components,
    };
    return this;
  };

  addPlugins = (plugins: StrapiGlobalPlugins) => {
    this.strapi.plugins = {
      ...this.strapi.plugins,
      ...plugins,
    };
    return this;
  };

  addPluginConfig = (config: Record<string, any>) => {
    this.strapi.config.plugins = {
      ...this.strapi.config.plugins,
      ...config,
    };
    return this;
  };

  setAdmin = (admin: StrapiGlobalAdmin) => {
    this.strapi.admin = admin;
    return this;
  };

  setApp = (app: StrapiGlobalApp) => {
    this.strapi.app = app;
    return this;
  };
  setConfig = (config: StrapiGlobalConfig) => {
    this.strapi.config = config;
    return this;
  };
  setConnections = (connections: StrapiGlobalConnections) => {
    this.strapi.connections = connections;
    return this;
  };
  setDB = (db: StrapiGlobalDB) => {
    this.strapi.db = db;
    return this;
  };
  setQuery = (query: StrapiGlobalQuery) => {
    this.strapi.query = query;
    return this;
  };

  build = (): Strapi => this.strapi;
}
