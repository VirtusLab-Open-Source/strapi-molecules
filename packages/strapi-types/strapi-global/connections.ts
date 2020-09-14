import Knex from "knex";

export type StrapiGlobalConnections = {
  default: typeof Knex;
};
