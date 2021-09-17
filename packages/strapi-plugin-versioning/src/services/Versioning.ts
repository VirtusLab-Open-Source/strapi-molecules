import { Context } from 'koa';
import {
  isObject,
  noop,
} from 'lodash';
import { GlobalQueryResult } from 'strapi-types';

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

const isSingleType = (kind: 'singleType' | 'collectionType') => kind === 'singleType';

const knexBuildQuery = (contentType: string, id: string): Promise<any[]> => {
  const builder = global.strapi.connections.default('versions');
  builder
    .select()
    .where({ content_type: contentType, entity_id: id })
    .returning('*')
    .toString();
  return builder;
};

const getVersionsForSingleType = async (model: GlobalQueryResult, contentType: string) => {
  const entity = await model.findOne({});
  if (entity) {
    return knexBuildQuery(contentType, entity.id)
  }
  return Promise.resolve([]);
};

const getVersionsForEntity = async (contentType: string, id: string) => {
  const model = global.strapi.query(contentType);
  if (model) {
    const { model: { kind } } = model;
    if (isSingleType(kind)) {
      return getVersionsForSingleType(model, contentType);
    }
    return knexBuildQuery(contentType, id);
  }
  return (<any>global.strapi).errors.badRequest('Content not exists');
};

module.exports = {
  getVersionsForEntity,
  saveDataInDB,
  getVersionsForAllConentTypes,
  isModelExists,
  findUid,
  getModelFromCtx,
};
