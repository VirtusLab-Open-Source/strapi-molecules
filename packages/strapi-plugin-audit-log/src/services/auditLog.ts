import { QueryBuilder } from 'knex';
import omitAll from 'lodash/fp/omitAll';
import camelCase from 'lodash/camelCase';
import deepDiff from 'deep-diff';
import { AvailableAction } from '../lib';


const PLUGIN_MODEL_NAME = 'plugins::audit-log.audit_logs';

const toCamelCase = (object: any) => {
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      const newKey = camelCase(key);
      object[newKey] = object[key];
      if (newKey !== key) {
        delete object[key];
      }
    }
  }
  return object;
};


const create = async (originId: string | number, userId: string, actionType: AvailableAction, originModelName: string, content: string): Promise<void> => {
  const entityService = global.strapi.entityService;
  if (entityService && entityService.create) {
    return entityService.create(
      {
        data: {
          content,
          origin_id: originId.toString(),
          model_name: originModelName,
          action: actionType,
          created_by: userId,
        },
      },
      { model: PLUGIN_MODEL_NAME },
    );
  }
  return new Promise(resolve => setTimeout(resolve, 0));
};

const getVersions = async (model: string, originId: string) => {
  const entityService = global.strapi.entityService;
  if (entityService && entityService.find) {
    const results = await entityService.find(
      {
        params: { origin_id: originId, model_name: model },
        populate: false,
      },
      { model: PLUGIN_MODEL_NAME });
    return {
      results: results
        .map(omitAll(['content', 'updated_by', 'created_by']))
        .map(toCamelCase),
    };
  }
  return Promise.resolve({ results: [] });
};

const getHistory = async (originId: string, model: string, version: string) => {
  const dataModel = global.strapi.query(PLUGIN_MODEL_NAME)?.model;
  const data = await dataModel?.query((qb: QueryBuilder) => {
    qb
      .where({ origin_id: originId, model_name: model })
      .andWhere('id', '>=', version);
  })
    .orderBy('id', 'DESC')
    .fetchAll({ withRelated: false });
  return data.toJSON();
};

const getSnapshots = async (model: string, originId: string, version: string) => {
  const serviceConfig = global.strapi.config.middleware.settings['audit-log'].map.find((_: any) => _.pluginName === model);
  const entityService = global.strapi.entityService;
  if (serviceConfig && entityService && entityService.find) {
    const service = global.strapi.plugins[serviceConfig.pluginName].services[serviceConfig.serviceName];
    const history = await getHistory(originId, model, version);
    const entity = await service[serviceConfig.fetchSingle || 'fetch'](originId);
    const changes = history.flatMap(({ content }: any) => content);
    changes.map((_: any) => {
      deepDiff.revertChange(entity, entity, _);
    });
    return { entity };
  }
  if (entityService && entityService.findOne) {
    const history = await getHistory(originId, model, version);
    let entity = await entityService.findOne(
      {
        params: {
          id: originId,
        },
        populate: true,
      },
      { model });
    entity = entity || {};
    const changes = history.flatMap(({ content }: any) => content);
    changes.map((_: any) => {
      deepDiff.revertChange(entity, entity, _);
    });
    return { entity };
  }
  return Promise.resolve({ entity: {} });
};


module.exports = {
  create,
  getVersions,
  getSnapshots,
};
