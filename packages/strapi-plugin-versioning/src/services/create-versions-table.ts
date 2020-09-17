"use strict";
import * as Knex from "knex";

module.exports = {
  async createVersionsTable(): Promise<void> {
    //check after knex type update
    const knex: any = global.strapi.connections.default;
    knex.schema
      .createTableIfNotExists("versions", (table: Knex.TableBuilder) => {
        table.increments("id");
        table.string("content_type");
        table.json("content");
        table.string("date");
        table.integer("entity_id");
        table.json("entity");
      })
      .then();
  },
};
