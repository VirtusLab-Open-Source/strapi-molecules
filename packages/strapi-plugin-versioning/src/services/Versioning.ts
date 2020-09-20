import { Context } from "koa";

type Entity = any;
type Data = Array<Entity>;

const getModelFromCtx = (ctx: Context): string | undefined => {
  if (ctx.params?.model) {
    return ctx.params.model;
  }
  return ctx.url.split("/")[1];
};

const isModelExists = (model: string | undefined): boolean => {
  if (model) {
    return !!Object.values(global.strapi.models).find(
      (el) => el.collectionName === model || el.uid === model,
    );
  }
  return false;
};

const findUid = (ctx: Context): string =>
  ctx.params.model
    ? global.strapi.db.getModel(ctx.params.model).uid
    : Object.values(global.strapi.models).find(
        (el) => el.collectionName == ctx.url.split("/")[1],
      )!.uid;

const saveDataInDB = async (
  data: Data,
  model: string,
  entity: Entity,
): Promise<void> => {
  const knexQueryBuilder = global.strapi.connections.default("versions");
  knexQueryBuilder
    .insert({
      date: new Date().toISOString(),
      content_type: model,
      content: JSON.stringify(data),
      entity_id: entity.id,
      entity: JSON.stringify(entity),
    })
    .then();
};

const getVersionsForAllConentTypes = async () => {
  const knexQueryBuilder = global.strapi.connections.default("versions");
  knexQueryBuilder.select().returning("*").toString();
  return await knexQueryBuilder;
};

module.exports = {
  saveDataInDB,
  getVersionsForAllConentTypes,
  isModelExists,
  findUid,
  getModelFromCtx,
};
