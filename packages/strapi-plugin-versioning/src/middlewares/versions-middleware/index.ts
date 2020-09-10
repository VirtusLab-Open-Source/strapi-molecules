const versioningService =
  global.strapi.plugins["versioning"].services.versioning;

module.exports = () => {
  return {
    initialize() {
      global.strapi.app.use(async (ctx, next) => {
        await next();
        const properMethods = ["PUT", "POST"];
        const model = versioningService.getModelFromCtx(ctx);
        if (
          properMethods.includes(ctx.response.request.method) &&
          versioningService.isModelExists(model) &&
          ctx.response.message == "OK"
        ) {
          const uid = versioningService.findUid(ctx);
          const updatedData = await global.strapi.db.query(uid).find();
          versioningService.saveDataInDB(updatedData, uid, ctx.response.body);
        }
      });
    },
  };
};
