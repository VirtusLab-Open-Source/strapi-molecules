const _ = require('lodash');
const { convertRestQueryParams } = require('strapi-utils');
const { buildDeepSearchCount, buildDeepSearch } = require("./utils/build-deep-query");
const { buildQuery } = require("./utils/build-query");

module.exports = {
  /**
   * Find multiple entries based on params
   * @param {object} model - Strapi contentType model
   * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
   * @param {(string|object)[]=}populate
   * @param transacting
   * @returns {Promise<any>}
   */
  find: async (model, params, populate, { transacting } = {}) => {
    const filters = convertRestQueryParams(params);

    return model
      .query(buildQuery({ model, filters }))
      .fetchAll({
        withRelated: populate,
        transacting,
      })
      .then(results => results.toJSON());
  },
  /**
   * Count entries based on filters
   * @param {object} model - Strapi contentType model
   * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
   * @returns {Promise<number>}
   */
  count: async (model, params = {}) => {
    const filters = convertRestQueryParams(params);

    return model
      .query(buildQuery({ model, filters }))
      .count()
      .then(Number);
  },
  /**
   * Find multiple entries based on filters including querySearch (_q)
   * @param {object} model - Strapi contentType model
   * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
   * @param {(string|object)[]=}populate
   * @returns {Promise<any>}
   */
  search: async (model, params, populate) => {
    const filters = convertRestQueryParams(_.omit(params, '_q'));

    return model
      .query(qb => {
        qb.distinct();
        qb.select(`${model.collectionName}.*`)
      })
      .query(buildDeepSearch({ model, params }))
      .query(buildQuery({ model, filters, shouldJoinComponents: false }))
      .query(qb => console.log(qb.toString()))
      .fetchAll({ withRelated: populate })
      .then(results => results.toJSON());
  },
  /**
   * Count entries based on filters including querySearch (_q)
   * @param {object} model - Strapi contentType model
   * @param {object} params - parameters like: _q, contentType.attribute_contains='searchQuery'
   * @returns {Promise<number>}
   */
  countSearch: async (model, params) => {
    const filters = convertRestQueryParams(_.omit(params, '_q'));
    return model
      .query(buildDeepSearchCount({ model }))
      .query(buildDeepSearch({ model, params }))
      .query(buildQuery({ model, filters, shouldJoinComponents: false }))
      .fetch()
      .then(r => Number(r.toJSON().count))
  }
};
