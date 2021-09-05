import { Context } from 'koa';
import {
  isObject,
  noop,
} from 'lodash';

type Entity = any;
type Data = Array<Entity>;

const getModelFromCtx = (ctx: Context): string | undefined => {
  if (ctx.params?.model) {
    return ctx.params.model;
  }
  return ctx.url.split('/')[1];
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
        (el) => el.collectionName == ctx.url.split('/')[1],
      )!.uid;

const saveDataInDB = async (
  data: Data,
  model: string,
  entity: Entity,
): Promise<void> => {
  const knexQueryBuilder = global.strapi.connections.default('versions');
  knexQueryBuilder
    .insert({
      date: new Date().toISOString(),
      content_type: model,
      content: isObject(data) ? JSON.stringify(data) : data,
      entity_id: entity.id,
      entity: isObject(data) ? JSON.stringify(data) : data,
    })
    .then(noop)
    .catch(noop);
};

const getVersionsForAllConentTypes = async () => {
  const knexQueryBuilder = global.strapi.connections.default('versions');
  knexQueryBuilder.select().returning('*').toString();
  return knexQueryBuilder;
};

const getVersionsForEntity = async (contentType: string, id: string) => {
  const model = global.strapi.query(contentType);
  const knexQueryBuilder = global.strapi.connections.default('versions');
  knexQueryBuilder
    .select();
  if (model) {
    const { model: { kind } } = model;
    if (kind === 'singleType') {
      const { id: singleTypeId } = await model.findOne({});
      knexQueryBuilder
        .where({ content_type: contentType, entity_id: singleTypeId });
    } else {
      knexQueryBuilder
        .where({ content_type: contentType, entity_id: id });
    }
  }
  knexQueryBuilder
    .returning('*')
    .toString();
  return knexQueryBuilder;
};

module.exports = {
  getVersionsForEntity,
  saveDataInDB,
  getVersionsForAllConentTypes,
  isModelExists,
  findUid,
  getModelFromCtx,
};
