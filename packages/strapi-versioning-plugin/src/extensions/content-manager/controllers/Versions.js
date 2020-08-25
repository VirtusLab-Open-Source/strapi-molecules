"use strict";

module.exports = {
  async listEntityVersions(ctx) {
    const { model, id } = ctx.params;
    const versionsForAllContentTypes = await strapi.plugins[
      "versioning-plugin"
    ].services.versioning.getVersionsForAllConentTypes();
    const versionsForCurrentContentType = versionsForAllContentTypes.filter(
      (version) => version.content_type == model,
    );

    const versionsForCurrentId = versionsForCurrentContentType.filter(
      (version) => version.entity_id == id,
    );
    return versionsForCurrentId.map((el) => ({
      content: JSON.parse(el.entity),
      date: el.date,
      id: el.id,
    }));
  },
};
