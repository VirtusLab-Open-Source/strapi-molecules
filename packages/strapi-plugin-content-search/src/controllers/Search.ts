import { Context } from 'koa';
import { get } from 'lodash';

module.exports = {
  async search(ctx: Context) {
    if (get(ctx, 'query._q', '') === '') {
      return ctx.throw(400, 'Malformed request body');
    }

    const { fetchData } = global.strapi.plugins[
      'content-search'
    ].services.searchabledata;

    const searchableContentTypes = Object.entries(global.strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key]) => _key);

    const payload = await fetchData(searchableContentTypes, ctx.query);
    const { transformResponse } = global.strapi.config.plugins[
      'content-search'
    ];
    if (typeof transformResponse === 'function') {
      return transformResponse(payload);
    }
    return payload;
  },
};
