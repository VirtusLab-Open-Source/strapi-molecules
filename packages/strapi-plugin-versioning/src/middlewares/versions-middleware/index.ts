const getVersioningService = () =>
  global.strapi.plugins['versioning'].services.versioning;

module.exports = () => {
  return {
    initialize() {
      const versioningService = getVersioningService();
      global.strapi.app.use(async (ctx, next) => {
        await next();
        const properMethods = ['PUT', 'POST'];
        const model = versioningService.getModelFromCtx(ctx);
        if (
          properMethods.includes(ctx.response.request.method) &&
          versioningService.isModelExists(model) &&
          ctx.response.message == 'OK'
        ) {
          const entity = ctx.response.body;
          if (entity.id) {
            const uid = versioningService.findUid(ctx);
            const updatedData = await global.strapi.db
              .query(uid)
              .findOne({ id: entity.id });
            versioningService.saveDataInDB(updatedData, uid, entity);
          }
        }
      });
    },
  };
};
