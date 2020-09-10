import { Context } from "koa";

type Content = {
  created_at: string;
  id: number;
  [key: string]: any;
};

type Version = {
  content: Content;
  date: string;
  id: number;
};

module.exports = {
  async listEntityVersions(ctx: Context): Promise<Version[]> {
    const { model, id } = ctx.params;
    const versionsForAllContentTypes: Content[] = await global.strapi.plugins[
      "versioning"
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
