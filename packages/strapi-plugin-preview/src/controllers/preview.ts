"use strict";
import { Context } from "koa";

module.exports = {
  isPreviewable: async (ctx: Context) => {
    const isPreviewable = await global.strapi.plugins.preview.services.preview.isPreviewable(
      ctx.params.contentType,
    );

    ctx.send({ isPreviewable });
  },

  findOne: async (ctx: Context) => {
    const contentPreview = await global.strapi.plugins.preview.services.preview.findOne(
      ctx.params.contentType,
      ctx.params.id,
    );

    ctx.send(contentPreview);
  },

  getPreviewUrl: async (ctx: Context) => {
    const previewUrl = await global.strapi.plugins.preview.services.preview.getPreviewUrl(
      ctx.params.contentType,
      ctx.params.id,
    );

    ctx.send(previewUrl);
  },
};
