import Knex from "knex";

import {
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
  StrapiGlobalServices,
} from "./strapi-global";

export class Strapi {
  components: StrapiGlobalComponents = {};
  plugins: StrapiGlobalPlugins = {};
  contentTypes: StrapiGlobalContentTypes = {};
  models: StrapiGlobalModels = {};
  services: StrapiGlobalServices = {};

  dir = "";
  log = {
    trace: console.trace,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    fatal: console.error,
    silent: console.log,
  };
  config: StrapiGlobalConfig = {
    get: (_s) => {
      throw new Error("For testing purposes please mock this function");
    },
  };
  connections: StrapiGlobalConnections = {
    get default(): Knex {
      throw new Error("For testing purposes please mock this function");
    },
  };
  app: StrapiGlobalApp = {
    use: (_callback) => {
      throw new Error("For testing purposes please mock this function");
    },
  };
  admin: StrapiGlobalAdmin = {
    services: {
      permission: {
        actionProvider: {
          register: (_actions) => {
            throw new Error("For testing purposes please mock this function");
          },
        },
      },
    },
  };
  db: StrapiGlobalDB = {
    query: (_uid) => {
      throw new Error("For testing purposes please mock this function");
    },
    getModel: (_modelName) => {
      throw new Error("For testing purposes please mock this function");
    },
  };

  query: StrapiGlobalQuery = (_s) => {
    throw new Error("For testing purposes please mock this function");
  };
}
