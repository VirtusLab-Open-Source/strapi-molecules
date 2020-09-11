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
} from "./strapi-global";

export class Strapi {
  components: StrapiGlobalComponents = {};
  plugins: StrapiGlobalPlugins = {};
  contentTypes: StrapiGlobalContentTypes = {};
  models: StrapiGlobalModels = {};

  config: StrapiGlobalConfig = {
    get: (_s) => {
      throw new Error("For testing purposes please mock this function");
    },
  };
  connections: StrapiGlobalConnections = {
    default: Knex,
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
