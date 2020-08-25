const versioningService =
  global.strapi.plugins["versioning-plugin"].services.versioning;

module.exports = () => {
  return {
    initialize() {
      global.strapi.app.use(async (ctx, next) => {
        await next();
        const properMethods = ["PUT", "POST"];
        if (
          properMethods.includes(ctx.response.request.method) &&
          versioningService.isModelExists(ctx) &&
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
