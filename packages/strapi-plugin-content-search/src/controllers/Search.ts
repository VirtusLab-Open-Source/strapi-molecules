const { parseMultipartData } = require("strapi-utils");

module.exports = {
  async search(ctx: any) {
    const { _q } = ctx.is("multipart")
      ? parseMultipartData(ctx)
      : ctx.request.body;
    if (!_q) {
      return ctx.throw(400, "Malformed request body");
    }

    const fetchAsyncData =
      global.strapi.plugins["content-search"].services.searchabledata
        .fetchAsyncData;

    const searchableContentTypes = Object.entries(global.strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key]) => _key);

    return fetchAsyncData(searchableContentTypes, _q);
  },
};
