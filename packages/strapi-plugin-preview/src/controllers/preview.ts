'use strict';
import { Context, ParameterizedContext } from 'koa';

type Tenant = {
  key: string;
  id: number;
  previewUrl: string;
};
type ContextWithTenants = {
  user: {
    tenants: Tenant[];
  };
};

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
      ctx.query,
    );

    ctx.send(contentPreview);
  },

  getPreviewUrl: (ctx: ParameterizedContext<ContextWithTenants>) => {
    const {
      params: { contentType, id },
      state: {
        user: { tenants },
      },
      query,
    } = ctx;
    const service = global.strapi.plugins.preview.services.preview;
    const tenantId = query?.tenantId ? Number(query.tenantId) : NaN;
    const tenant = tenants.find(
      (t) => t.id === tenantId || t.key === query?.tenantKey,
    );
    const url = tenant
      ? service.getTenantUrl(tenant, contentType, id)
      : service.getPreviewUrl(contentType, id);

    ctx.send({ url });
  },
};
