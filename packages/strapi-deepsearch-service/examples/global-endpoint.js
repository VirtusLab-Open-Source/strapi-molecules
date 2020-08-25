// api/deep-search/controllers/deepSearch.js
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
    const { modelName } = ctx.params;
    validateModelName(modelName);
    const model = strapi.query(modelName).model;
    if (ctx.query._q) {
      entities = await search(model, ctx.query);
    } else {
      entities = await find(model, ctx.query);
    }
    return entities.map((entity) => sanitizeEntity(entity, { model }));
  },
  count(ctx) {
    const { modelName } = ctx.params;
    validateModelName(modelName);
    const model = strapi.query(modelName).model;

    if (ctx.query._q) {
      return countSearch(model, ctx.query);
    }
    return count(model, ctx.query);
  },
};

function validateModelName(modelName) {
  if (!strapi.models.hasOwnProperty(modelName)) {
    const err = new Error();
    err.status = 404;
    throw err;
  }
}
