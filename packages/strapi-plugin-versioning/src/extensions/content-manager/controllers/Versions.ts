import { Context } from 'koa';

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
    const service = global.strapi.plugins['versioning'].services.versioning;
    const versionsForCurrentContentType: Content[] = await service.getVersionsForEntity(
      model,
      id,
    );
    return versionsForCurrentContentType.map((el) => ({
      content: JSON.parse(el.entity),
      date: el.date,
      id: el.id,
    }));
  },
};
