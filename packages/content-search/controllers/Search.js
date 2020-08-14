const { parseMultipartData } = require("strapi-utils");

module.exports = {
  async search(ctx) {
    const { _q } = ctx.is("multipart")
      ? parseMultipartData(ctx)
      : ctx.request.body;
    if (!_q) {
      return ctx.throw(400, "Malformed request body");
    }

    const fetchAsyncData =
      strapi.plugins["content-search"].services.searchabledata.fetchAsyncData;

    const searchableContentTypes = Object.entries(strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key, value]) => _key);

    return fetchAsyncData(searchableContentTypes, _q);
  },
};
