import { Context } from 'koa';

module.exports = {
  getHistory(ctx: Context) {
    const { model, id: originId } = ctx.request.query;
    if (!model) {
      return ctx.badRequest('Model is required');
    }
    if (!originId) {
      return ctx.badRequest('ID is required');
    }
    const service = global.strapi.plugins['audit-log'].services.auditlog;
    return service.getVersions(model, originId);
  },
  getSnapshots(ctx: Context) {
    const { originId } = ctx.params;
    const { version, model } = ctx.query;
    if (!model) {
      return ctx.badRequest('Model is required');
    }
    if (!originId) {
      return ctx.badRequest('ID is required');
    }
    const service = global.strapi.plugins['audit-log'].services.auditlog;
    return service.getSnapshots(model, originId, version);
  },
};
