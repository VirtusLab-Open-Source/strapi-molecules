import { Context } from 'koa';
import { get } from 'lodash';

module.exports = {
  async search(ctx: Context) {
    if (get(ctx, 'query._q', '') === '') {
      return ctx.badRequest();
    }

    const { searchContentTypes } = global.strapi.plugins[
      'content-search'
    ].services.searchabledata;

    const searchableContentTypes = Object.entries(global.strapi.contentTypes)
      .filter(([_key, value]) => value.options.searchable)
      .map(([_key]) => _key);

    const payload = await searchContentTypes(searchableContentTypes, ctx.query);
    const { transformResponse } = global.strapi.config.plugins[
      'content-search'
    ];
    if (typeof transformResponse === 'function') {
      return transformResponse(payload);
    }
    return payload;
  },
  async searchByFields(ctx: Context) {
    if (
      !ctx.request.body?.contentTypes ||
      !ctx.request.body?._q ||
      ctx.request.body._q === ''
    ) {
      return ctx.badRequest();
    }
    const { getFieldsToSearch, searchByFields } = global.strapi.plugins[
      'content-search'
    ].services.searchabledata;
    const searchableFields = getFieldsToSearch(ctx.request.body.contentTypes);
    const payload = await searchByFields(searchableFields, {
      ...ctx.query,
      _q: ctx.request.body._q,
    });

    const { transformResponse } = global.strapi.config.plugins[
      'content-search'
    ];
    if (typeof transformResponse === 'function') {
      return transformResponse(payload);
    }
    return payload;
  },
};
