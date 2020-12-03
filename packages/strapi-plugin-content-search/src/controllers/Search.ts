import { Context } from 'koa';

module.exports = {
  async search(ctx: Context) {
    if (!ctx.query) {
      return ctx.throw(400, 'Malformed request body');
    }

    const { fetchData } = global.strapi.plugins[
      'content-search'
    ].services.searchabledata;

    const searchableContentTypes = Object.entries(global.strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key]) => _key);

    const payload = await fetchData(searchableContentTypes, ctx.query);
    const { beforeSend } = global.strapi.config.plugins['content-search'];
    if (typeof beforeSend === 'function') {
      return beforeSend(payload);
    }
    return payload;
  },
};
