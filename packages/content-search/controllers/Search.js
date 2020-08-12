const { parseMultipartData } = require("strapi-utils");

module.exports = {
  async search(ctx) {
    const generateRequestBodyCtx =
      strapi.plugins["content-search"].services.requestbodyctx
        .generateRequestBodyCtx;

    const { _q } = ctx.is("multipart")
      ? parseMultipartData(ctx)
      : generateRequestBodyCtx(ctx, "_q");

    const fetchAsyncSearchableData =
      strapi.plugins["content-search"].services.searchabledata
        .fetchAsyncSearchableData;

    const searchableContentTypes = Object.entries(strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key, value]) => _key);
    return fetchAsyncSearchableData(searchableContentTypes, _q);
  }
};

