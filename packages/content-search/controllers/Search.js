const { parseMultipartData } = require("strapi-utils");

module.exports = {
  async search(ctx) {
    let _q;
    if (ctx.is("multipart")) {
      _q = parseMultipartData(ctx)["_q"];
    } else {
      _q = JSON.parse(ctx.request.body)["_q"];
    }
    const searchableContentTypes = Object.entries(strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key, value]) => _key);
    return strapi.plugins[
      "content-search"
    ].services.searchabledata.fetchAsyncSearchableData(
      searchableContentTypes,
      _q
    );
  }
};

