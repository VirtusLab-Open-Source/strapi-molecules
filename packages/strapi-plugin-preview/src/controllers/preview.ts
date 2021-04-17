'use strict';
import { Context } from 'koa';

module.exports = {
  async findOne(ctx: Context) {
    const data = await global.strapi.plugins.preview.services.preview.findOne(
      ctx.params.contentType,
      ctx.params.id,
      ctx.query,
    );
    if (global.strapi.config.plugins['preview']) {
      const { transformResponse } = global.strapi.config.plugins['preview'];
      if (typeof transformResponse === 'function') {
        return transformResponse(data, ctx.params.contentType, ctx.params.id);
      }
    }

    return {
      data,
      contentType: ctx.params.contentType,
    };
  },

  getPreviewUrl(ctx: Context) {
    const {
      params: { contentType, id },
      query,
    } = ctx;
    const service = global.strapi.plugins.preview.services.preview;
    const url = service.getPreviewUrl(contentType, id, query);

    ctx.send({ url });
  },
};
