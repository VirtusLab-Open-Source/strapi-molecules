const _ = require('lodash');
const { escapeQuery } = require('strapi-utils');
const { isModelAttrSearchable } = require('./component-utils');

/**
 * util to build search query
 * copied from: strapi/packages/strapi-connector-bookshelf/lib/queries.js
 * @param {*} model
 * @param {*} params
 * @param {object} qb - knex query builder instance
 */
const buildSearchQuery = ({ model, params, qb, fields }) => {
  const query = params._q;

  const associations = model.associations.map((x) => x.alias);
  const stringTypes = [
    'string',
    'text',
    'uid',
    'email',
    'enumeration',
    'richtext',
  ];
  const numberTypes = ['biginteger', 'integer', 'decimal', 'float'];

  const _searchColumns = Object.keys(model._attributes)
    .filter((attribute) => !associations.includes(attribute))
    .filter((attribute) =>
      stringTypes.includes(model._attributes[attribute].type),
    );
  if (!_.isNaN(_.toNumber(query))) {
    const numberColumns = Object.keys(model._attributes)
      .filter((attribute) => !associations.includes(attribute))
      .filter((attribute) =>
        numberTypes.includes(model._attributes[attribute].type),
      );
    _searchColumns.push(...numberColumns);
  }

  if ([...numberTypes, ...stringTypes].includes(model.primaryKeyType)) {
    _searchColumns.push(model.primaryKey);
  }
  const searchColumns = _searchColumns.filter((attr) => {
    const shouldSearchField = Array.isArray(fields)
      ? fields.some((f) => f.name === attr)
      : true;
    return isModelAttrSearchable(model, attr) && shouldSearchField;
  });
  // Search in columns with text using index.
  switch (model.client) {
    case 'pg':
      searchColumns.forEach((attr) =>
        qb.orWhereRaw(
          `"${model.collectionName}"."${attr}"::text ILIKE ?`,
          `%${escapeQuery(query, '*%\\')}%`,
        ),
      );
      break;
    case 'sqlite3':
      searchColumns.forEach((attr) =>
        qb.orWhereRaw(
          `"${model.collectionName}"."${attr}" LIKE ? ESCAPE '\\'`,
          `%${escapeQuery(query, '*%\\')}%`,
        ),
      );
      break;
    case 'mysql':
      searchColumns.forEach((attr) =>
        qb.orWhereRaw(
          `\`${model.collectionName}\`.\`${attr}\` LIKE ?`,
          `%${escapeQuery(query, '*%\\')}%`,
        ),
      );
      break;
  }
};

module.exports = {
  buildSearchQuery,
};
