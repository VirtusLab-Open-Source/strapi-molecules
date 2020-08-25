// api/restaurant/controllers/restaurant.js
const { sanitizeEntity } = require("strapi-utils");
const {
  find,
  count,
  search,
  countSearch,
} = require("strapi-deepsearch-service");

module.exports = {
  async find(ctx) {
    let entities;
    const model = strapi.models.restaurant;

    if (ctx.query._q) {
      entities = await search(model, ctx.query);
    } else {
      entities = await find(model, ctx.query);
    }

    return entities.map((entity) => sanitizeEntity(entity, { model }));
  },
  count(ctx) {
    const model = strapi.models.restaurant;
    if (ctx.query._q) {
      return countSearch(model, ctx.query);
    }
    return count(model, ctx.query);
  },
};
