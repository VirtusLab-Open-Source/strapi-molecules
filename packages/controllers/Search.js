module.exports = {
  async search(ctx) {
    const { searchQuery } = JSON.parse(ctx.request.body);
    const searchableContentTypes = Object.entries(strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key, value]) => value.info.name);
    return strapi.plugins[
      "content-search"
    ].services.searchabledata.fetchAsyncSearchableData(
      searchableContentTypes,
      searchQuery
    );
  }
};

