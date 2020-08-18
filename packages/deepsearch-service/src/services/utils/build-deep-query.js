const _ = require("lodash");
const { buildSearchQuery } = require("./build-search-query");
const { isModelSearchable } = require("./component-utils");

const buildDeepSearchCount = ({ model }) => (qb) => {
  qb.select(
    strapi.connections.default.raw(
      `count (distinct "${model.collectionName}") as "count"`,
    ),
  );
};

const buildDeepSearch = ({ model, params }) => (qb) => {
  buildJoins({ model, qb });
  qb.where((qb) => buildWhereClauses({ model, qb, params }));
};

function getJoinTable(collectionName) {
  return `${collectionName}_components`;
}

function getComponentsFromAttributes(modelAttributes) {
  const components = [];
  Object.values(modelAttributes).forEach((attr) => {
    if (attr.type === "component") {
      components.push(attr.component);
    } else if (attr.type === "dynamiczone") {
      components.push(...attr.components);
    }
  });
  return _.uniq(components);
}

const buildJoins = ({ model, qb }) => {
  const { attributes } = model;
  const componentNames = getComponentsFromAttributes(attributes);
  const componentModels = componentNames
    .map((componentName) => strapi.components[componentName])
    .filter(isModelSearchable);

  if (!_.isEmpty(componentModels)) {
    const joinTable = buildComponentsJoin({ model, qb });
    componentModels.forEach((model) => {
      buildComponentsTargetJoin({ qb, joinTable, model });
      buildJoins({ model, qb });
    });
  }
};

/**
 * Build Join for ComponentsJoinModel, in relation many to many or similar
 * need to have third table for example articles_components or pages_components
 * @param qb
 * @param model
 * @returns {string} Name of join table
 */
const buildComponentsJoin = ({ qb, model }) => {
  const { componentsJoinModel, collectionName, primaryKey } = model;
  const joinTable = getJoinTable(collectionName);
  qb.leftJoin(
    joinTable,
    `${joinTable}.${componentsJoinModel.foreignKey}`,
    `${collectionName}.${primaryKey}`,
  );

  return joinTable;
};

/**
 *
 * Build Join for target table from many to many relation or similar
 * for example when articles has relation to component Paragram -> build left join to components_paragraphs
 * @param qb
 * @param model
 * @param joinTable
 */
const buildComponentsTargetJoin = ({ qb, model, joinTable }) => {
  const { collectionName, primaryKey } = model;

  qb.leftJoin(collectionName, (_qb) => {
    _qb
      .on(`${joinTable}.component_id`, "=", `${collectionName}.${primaryKey}`)
      .andOn(
        `${joinTable}.component_type`,
        "=",
        strapi.connections.default.raw(`'${collectionName}'`),
      );
  });
};

const buildWhereClauses = ({ model, qb, params }) => {
  const { attributes } = model;
  const componentNames = getComponentsFromAttributes(attributes);

  buildSearchQuery({ model, qb, params });
  if (!_.isEmpty(componentNames)) {
    componentNames.forEach((componentName) => {
      const componentModel = strapi.components[componentName];
      if (isModelSearchable(componentModel)) {
        buildWhereClauses({ model: componentModel, qb, params });
      }
    });
  }
};

module.exports = {
  buildDeepSearchCount,
  buildDeepSearch,
  buildComponentsJoin,
  buildComponentsTargetJoin,
};
