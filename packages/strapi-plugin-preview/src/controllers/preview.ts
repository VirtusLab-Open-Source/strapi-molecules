'use strict';
import { Context } from 'koa';

module.exports = {
  async isPreviewable(ctx: Context) {
    const isPreviewable = await global.strapi.plugins.preview.services.preview.isPreviewable(
      ctx.params.contentType,
    );

    ctx.send({ isPreviewable });
  },

  async findOne(ctx: Context) {
    const contentPreview = await global.strapi.plugins.preview.services.preview.findOne(
      ctx.params.contentType,
      ctx.params.id,
      ctx.query,
    );

    ctx.send(contentPreview);
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
