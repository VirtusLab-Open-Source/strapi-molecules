import _ from 'lodash';
import { convertRestQueryParams } from 'strapi-utils';
import {
  buildDeepSearchCount,
  buildDeepSearch,
} from './utils/build-deep-query';
import { buildQuery } from './utils/build-query';

/**
 * Find multiple entries based on params
 * @param {object} model - Strapi contentType model
 * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
 * @param {(string|object)[]=}populate
 * @param transacting
 * @returns {Promise<any>}
 */
export const find = async (model, params, populate, { transacting } = {}) => {
  const filters = convertRestQueryParams(params);

  return model
    .query(buildQuery({ model, filters }))
    .fetchAll({
      withRelated: populate,
      transacting,
    })
    .then((results) => results.toJSON());
};
/**
 * Count entries based on filters
 * @param {object} model - Strapi contentType model
 * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
 * @returns {Promise<number>}
 */
export const count = async (model, params = {}) => {
  const filters = convertRestQueryParams(params);

  return model.query(buildQuery({ model, filters })).count().then(Number);
};
/**
 * Find multiple entries based on filters including querySearch (_q)
 * @param {object} model - Strapi contentType model
 * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
 * @param {(string|object)[]=}populate
 * @param {array} fields - fields to include in search
 * @returns {Promise<any>}
 */
export const search = async (model, params, populate, fields) => {
  const filters = convertRestQueryParams(_.omit(params, '_q'));

  return model
    .query((qb) => {
      qb.distinct();
      qb.select(`${model.collectionName}.*`);
    })
    .query(buildDeepSearch({ model, params, fields }))
    .query(buildQuery({ model, filters, shouldJoinComponents: false }))
    .fetchAll({ withRelated: populate })
    .then((results) => results.toJSON());
};
/**
 * Count entries based on filters including querySearch (_q)
 * @param {object} model - Strapi contentType model
 * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
 * @param {array} fields - fields to include in search
 * @returns {Promise<number>}
 */
export const countSearch = async (model, params, fields) => {
  const filters = convertRestQueryParams(_.omit(params, '_q'));
  return model
    .query(buildDeepSearchCount({ model }))
    .query(buildDeepSearch({ model, params, fields }))
    .query(buildQuery({ model, filters, shouldJoinComponents: false }))
    .fetch()
    .then((r) => Number(r.toJSON().count));
};
