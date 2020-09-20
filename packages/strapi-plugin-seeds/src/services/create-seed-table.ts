import { SEEDS_TABLE } from "./utils";

export const create = async (): Promise<void> => {
  const knex = global.strapi.connections.default;
  if (knex.schema.hasTable(SEEDS_TABLE)) {
    return;
  }
  return knex.schema
    .createTableIfNotExists(SEEDS_TABLE, (table) => {
      table.increments("id").primary();
      table.string("filename").notNullable();
      table.string("contentType").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .then();
};
