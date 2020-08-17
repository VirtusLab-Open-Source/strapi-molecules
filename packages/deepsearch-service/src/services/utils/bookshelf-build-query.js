const _ = require("lodash");
const { getComponentByModel, isModelComponent } = require("./component-utils");
const {
  buildComponentsJoin,
  buildComponentsTargetJoin,
} = require("./build-deep-query");

/**
 * Add joins and where filters
 * @param {Object} qb - knex query builder
 * @param {Object} model - Bookshelf model
 * @param {Array<Object>} whereClauses - an array of where clause
 * @param {Array<Object>} whereClauses - an array of where clause
 * @param {Boolean} shouldJoinComponents - specified should build query with Joining statement for components
 */
const buildJoinsAndFilter = (qb, model, whereClauses, shouldJoinComponents) => {
  const aliasMap = {};
  /**
   * Returns an alias for a name (simple incremental alias name)
   * @param {string} name - name to alias
   */
  const generateAlias = (name) => {
    if (!aliasMap[name]) {
      aliasMap[name] = 1;
    }

    const alias = `${name}_${aliasMap[name]}`;
    aliasMap[name] += 1;
    return alias;
  };

  /**
   * Build a query joins and where clauses from a query tree
   * @param {Object} qb - Knex query builder
   * @param {Object} queryTree - Query tree
   */
  const buildQueryFromTree = (qb, queryTree) => {
    // build joins
    Object.keys(queryTree.children).forEach((key) => {
      const subQueryTree = queryTree.children[key];
      if (!subQueryTree.isModelComponent) {
        buildJoin(qb, subQueryTree.assoc, queryTree, subQueryTree);
      } else if (shouldJoinComponents) {
        const joinTable = buildComponentsJoin({ qb, model: queryTree.model });
        buildComponentsTargetJoin({ qb, model: subQueryTree.model, joinTable });
      }

      buildQueryFromTree(qb, subQueryTree);
    });
    // build where clauses
    queryTree.where.forEach((w) => buildWhereClause({ qb, ...w }));
  };

  /**
   * Add table joins
   * @param {Object} qb - Knex query builder
   * @param {Object} assoc - Models association info
   * @param {Object} originInfo - origin from which you are making a join
   * @param {Object} destinationInfo - destination with which we are making a join
   */
  const buildJoin = (qb, assoc, originInfo, destinationInfo) => {
    if (["manyToMany", "manyWay"].includes(assoc.nature)) {
      const joinTableAlias = generateAlias(assoc.tableCollectionName);

      let originColumnNameInJoinTable;
      if (assoc.nature === "manyToMany") {
        originColumnNameInJoinTable = `${joinTableAlias}.${singular(
          destinationInfo.model.attributes[assoc.via].attribute,
        )}_${destinationInfo.model.attributes[assoc.via].column}`;
      } else if (assoc.nature === "manyWay") {
        originColumnNameInJoinTable = `${joinTableAlias}.${singular(
          originInfo.model.collectionName,
        )}_${originInfo.model.primaryKey}`;
      }

      qb.leftJoin(
        `${originInfo.model.databaseName}.${assoc.tableCollectionName} AS ${joinTableAlias}`,
        originColumnNameInJoinTable,
        `${originInfo.alias}.${originInfo.model.primaryKey}`,
      );

      qb.leftJoin(
        `${destinationInfo.model.databaseName}.${destinationInfo.model.collectionName} AS ${destinationInfo.alias}`,
        `${joinTableAlias}.${singular(
          originInfo.model.attributes[assoc.alias].attribute,
        )}_${originInfo.model.attributes[assoc.alias].column}`,
        `${destinationInfo.alias}.${destinationInfo.model.primaryKey}`,
      );
    } else {
      const externalKey =
        assoc.type === "collection"
          ? `${destinationInfo.alias}.${
              assoc.via || destinationInfo.model.primaryKey
            }`
          : `${destinationInfo.alias}.${destinationInfo.model.primaryKey}`;

      const internalKey =
        assoc.type === "collection"
          ? `${originInfo.alias}.${originInfo.model.primaryKey}`
          : `${originInfo.alias}.${assoc.alias}`;

      qb.leftJoin(
        `${destinationInfo.model.databaseName}.${destinationInfo.model.collectionName} AS ${destinationInfo.alias}`,
        externalKey,
        internalKey,
      );
    }
  };

  /**
   * Create a query tree node from a key an assoc and a model
   * @param {Object} model - Strapi model
   * @param {Object} assoc - Strapi association
   */
  const createTreeNode = (model, assoc = null) => {
    return {
      alias: generateAlias(model.collectionName),
      assoc,
      model,
      where: [],
      children: {},
    };
  };

  /**
   * Builds a Strapi query tree easy
   * @param {Array<Object>} whereClauses - Array of Strapi where clause
   * @param {Object} model - Strapi model
   * @param {Object} queryTree - queryTree
   */
  const buildQueryTree = (whereClauses, model, queryTree) => {
    for (let whereClause of whereClauses) {
      const { field, operator, value } = whereClause;
      let assocModel;
      let [key, ...parts] = field.split(".");
      const assoc = findAssoc(model, key);
      if (isModelComponent(model, key)) {
        assocModel = getComponentByModel(model, key);
        // init sub query tree
        if (!queryTree.children[key]) {
          queryTree.children[key] = {
            ...createTreeNode(assocModel, assoc, true),
            alias: assocModel.collectionName,
            isModelComponent: true,
          };
        }
      } else {
        // if the key is an attribute add as where clause
        if (!assoc) {
          queryTree.where.push({
            field: `${queryTree.alias}.${key}`,
            operator,
            value,
          });
          continue;
        }
        assocModel = findModelByAssoc(assoc);
        // init sub query tree
        if (!queryTree.children[key]) {
          queryTree.children[key] = createTreeNode(assocModel, assoc);
        }
      }

      // if the last part of the path is an association
      // add the primary key of the model to the parts
      if (parts.length === 0) {
        parts = [assocModel.primaryKey];
      }

      buildQueryTree(
        [
          {
            field: parts.join("."),
            operator,
            value,
          },
        ],
        assocModel,
        queryTree.children[key],
      );
    }

    return queryTree;
  };

  const root = buildQueryTree(whereClauses, model, {
    alias: model.collectionName,
    assoc: null,
    model,
    where: [],
    children: {},
  });
  return buildQueryFromTree(qb, root);
};

/**
 * Builds a sql where clause
 * @param {Object} options - Options
 * @param {Object} options.qb - Bookshelf (knex) query builder
 * @param {Object} options.field - Filtered field
 * @param {Object} options.operator - Filter operator (=,in,not eq etc..)
 * @param {Object} options.value - Filter value
 */
const buildWhereClause = ({ qb, field, operator, value }) => {
  if (Array.isArray(value) && !["in", "nin"].includes(operator)) {
    return qb.where((subQb) => {
      for (let val of value) {
        subQb.orWhere((q) =>
          buildWhereClause({ qb: q, field, operator, value: val }),
        );
      }
    });
  }

  switch (operator) {
    case "eq":
      return qb.where(field, value);
    case "ne":
      return qb.where(field, "!=", value);
    case "lt":
      return qb.where(field, "<", value);
    case "lte":
      return qb.where(field, "<=", value);
    case "gt":
      return qb.where(field, ">", value);
    case "gte":
      return qb.where(field, ">=", value);
    case "in":
      return qb.whereIn(field, Array.isArray(value) ? value : [value]);
    case "nin":
      return qb.whereNotIn(field, Array.isArray(value) ? value : [value]);
    case "contains":
      return qb.whereRaw("LOWER(??) LIKE LOWER(?)", [field, `%${value}%`]);
    case "ncontains":
      return qb.whereRaw("LOWER(??) NOT LIKE LOWER(?)", [field, `%${value}%`]);
    case "containss":
      return qb.where(field, "like", `%${value}%`);
    case "ncontainss":
      return qb.whereNot(field, "like", `%${value}%`);
    case "null": {
      return value ? qb.whereNull(field) : qb.whereNotNull(field);
    }

    default:
      throw new Error(`Unhandled whereClause : ${field} ${operator} ${value}`);
  }
};

/**
 * Returns a Bookshelf model based on a model association
 * @param {Object} assoc - A strapi association
 */
const findModelByAssoc = (assoc) => {
  const { models } = assoc.plugin ? strapi.plugins[assoc.plugin] : strapi;
  return models[assoc.collection || assoc.model];
};

const findAssoc = (model, key) =>
  model.associations.find((assoc) => assoc.alias === key);

/**
 * Build filters on a bookshelf query
 * @param {Object} options - Options
 * @param {Object} options.model - Bookshelf model
 * @param {Object} options.filters - Filters params (start, limit, sort, where)
 * @param {Boolean} options.shouldJoinComponents - if combined with _q should not building joins for components
 */
const bookshelfBuildQuery = ({ model, filters, shouldJoinComponents }) => (
  qb,
) => {
  if (
    _.has(filters, "where") &&
    Array.isArray(filters.where) &&
    filters.where.length > 0
  ) {
    qb.distinct();
    buildJoinsAndFilter(qb, model, filters.where, shouldJoinComponents);
  }

  if (_.has(filters, "sort")) {
    qb.orderBy(
      filters.sort.map(({ field, order }) => ({
        column: field,
        order,
      })),
    );
  }

  if (_.has(filters, "start")) {
    qb.offset(filters.start);
  }

  if (_.has(filters, "limit") && filters.limit >= 0) {
    qb.limit(filters.limit);
  }
};

module.exports = {
  bookshelfBuildQuery,
};
