"use strict";

module.exports = {
  async createVersionsTable(): Promise<void> {
    const knex = global.strapi.connections.default;
    knex.schema
      .createTableIfNotExists("versions", (table) => {
        table.increments("id");
        table.string("content_type");
        table.string("content");
        table.string("date");
        table.integer("entity_id");
        table.string("entity");
      })
      .then();
  },
};
