import { QueryBuilder } from 'knex';
import { isEmpty } from 'lodash';
import { Attribute, Model } from 'strapi-types';
import { singular } from 'pluralize';

import { buildSearchQuery } from './build-search-query';
import {
  getSearchableComponents,
  getSearchableModels,
  isCollectionAssoc,
  isModelAssoc,
} from './models-utils';

export const buildDeepSearchCount = ({ model }: { model: Model }) => (
  qb: QueryBuilder,
) => {
  qb.select(
    global.strapi.connections.default.raw(
      `count (distinct "${model.collectionName}") as "count"`,
    ),
  );
};
type AndCondition = [string, string];
type OrCondition = AndCondition[];
type QueryLeaf = {
  joinTable: string;
  orConditions: OrCondition[];
};

class QueryTree {
  tree: QueryLeaf[] = [];
  aliasMap: { [key: string]: number } = {};

  buildTree(model: Model, fields?: Fields[]) {
    const {
      collectionName,
      primaryKey,
      attributes,
      componentsJoinModel,
    } = model;
    const attrs = this.getAttrsByFields(attributes, fields);

    const { componentModels, relationModels } = getSearchableModels(attrs);
    if (!isEmpty(componentModels)) {
      const joinTable = getJoinTable(collectionName);
      this.addJoin(joinTable, [
        [
          `${joinTable}.${componentsJoinModel.foreignKey}`,
          `${collectionName}.${primaryKey}`,
        ],
      ]);

      componentModels.forEach((model) => {
        const { collectionName, primaryKey } = model;
        this.addJoin(collectionName, [
          [`${joinTable}.component_id`, `${collectionName}.${primaryKey}`],
          [
            `${joinTable}.component_type`,
            (global.strapi.connections.default.raw(
              `'${collectionName}'`,
            ) as any) as string,
          ],
        ]);
        this.buildTree(model);
      });
    }
    const originInfo = {
      model,
      alias: model.collectionName,
    };

    relationModels.forEach((relationToModel) =>
      this.buildRelationsJoin(originInfo, relationToModel),
    );

    return this;
  }

  getAttrsByFields(attributes: Record<string, Attribute>, fields?: Fields[]) {
    return fields === undefined
      ? attributes
      : Object.entries(attributes).reduce((acc, [key, attr]) => {
          if (fields.some((f) => f.name === key)) {
            acc[key] = attr;
          }
          return acc;
        }, {} as typeof attributes);
  }

  findByJoinTable(joinTable: string) {
    return this.tree.find((leaf) => leaf.joinTable === joinTable);
  }

  generateAlias(name: string) {
    if (!this.aliasMap[name]) {
      this.aliasMap[name] = 1;
    }

    const alias = `${name}_${this.aliasMap[name]}`;
    this.aliasMap[name] += 1;
    return alias;
  }

  buildRelationsJoin(
    originInfo: { model: Model; alias: string },
    relationTo: Model,
  ) {
    const destinationInfo = {
      model: relationTo,
      alias: this.generateAlias(relationTo.collectionName),
    };
    const assoc = originInfo.model.associations.find((assoc) => {
      if (isCollectionAssoc(assoc)) {
        return assoc.collection === relationTo.modelName;
      }
      if (isModelAssoc(assoc)) {
        return assoc.model === relationTo.modelName;
      }
    });
    if (!assoc) {
      return;
    }

    if (
      isCollectionAssoc(assoc) &&
      ['manyToMany', 'manyWay'].includes(assoc.nature)
    ) {
      const joinTableAlias = this.generateAlias(assoc.tableCollectionName);
      let originColumnNameInJoinTable = '';
      if (assoc.nature === 'manyToMany') {
        originColumnNameInJoinTable = `${joinTableAlias}.${singular(
          destinationInfo.model.attributes[assoc.via].attribute,
        )}_${destinationInfo.model.attributes[assoc.via].column}`;
      } else if (assoc.nature === 'manyWay') {
        originColumnNameInJoinTable = `${joinTableAlias}.${singular(
          originInfo.model.collectionName,
        )}_${originInfo.model.primaryKey}`;
      }

      this.addJoin(
        `${originInfo.model.databaseName}.${assoc.tableCollectionName} AS ${joinTableAlias}`,
        [
          [
            originColumnNameInJoinTable,
            `${originInfo.alias}.${originInfo.model.primaryKey}`,
          ],
        ],
      );

      this.addJoin(
        `${destinationInfo.model.databaseName}.${destinationInfo.model.collectionName}`,
        [
          [
            `${joinTableAlias}.${singular(
              originInfo.model.attributes[assoc.alias].attribute,
            )}_${originInfo.model.attributes[assoc.alias].column}`,
            `${destinationInfo.model.collectionName}.${destinationInfo.model.primaryKey}`,
          ],
        ],
      );
    } else {
      const externalKey =
        assoc.type === 'collection'
          ? `${destinationInfo.alias}.${
              assoc.via || destinationInfo.model.primaryKey
            }`
          : `${destinationInfo.alias}.${destinationInfo.model.primaryKey}`;

      const internalKey =
        assoc.type === 'collection'
          ? `${originInfo.alias}.${originInfo.model.primaryKey}`
          : `${originInfo.alias}.${assoc.alias}`;

      this.addJoin(
        `${destinationInfo.model.databaseName}.${destinationInfo.model.collectionName} AS ${destinationInfo.alias}`,
        [[externalKey, internalKey]],
      );
    }
  }

  addJoin(joinTable: string, columns: OrCondition) {
    if (!this.findByJoinTable(joinTable)) {
      this.tree = [
        ...this.tree,
        {
          joinTable,
          orConditions: [columns],
        },
      ];
    } else {
      const existingIndex = this.tree.findIndex(
        (leaf) => leaf.joinTable === joinTable,
      );
      const existingLeaf = this.tree[existingIndex];
      existingLeaf.orConditions.push(columns);
      this.tree.splice(existingIndex, 1);
      this.tree = [...this.tree, existingLeaf];
    }

    return this;
  }

  buildJoins(qb: QueryBuilder) {
    this.tree.forEach(({ joinTable, orConditions }) => {
      qb.leftJoin(joinTable, (qb) => {
        orConditions.forEach((andConditions) => {
          qb.orOn((qb) => {
            andConditions.forEach(([col1, col2]) => {
              qb.andOn(col1, col2);
            });
          });
        });
      });
    });
    return this;
  }

  buildWhereClauses({
    model,
    qb,
    params,
    fields,
  }: {
    qb: QueryBuilder;
    model: Model;
    params: Record<string, string>;
    fields?: Fields[];
  }) {
    const attrs = this.getAttrsByFields(model.attributes, fields);
    const { componentModels, relationModels } = getSearchableModels(attrs);

    buildSearchQuery({
      model,
      qb,
      params,
      fields,
    });
    componentModels.forEach((model) => {
      this.buildWhereClauses({
        model,
        qb,
        params,
      });
    });
    relationModels.forEach((model) => {
      this.buildWhereClauses({
        model,
        qb,
        params,
      });
    });

    return this;
  }
}

type Fields = {
  name: string;
  fields?: Fields;
};
export const buildDeepSearch = ({
  model,
  params,
  fields,
}: {
  model: Model;
  params: Record<string, string>;
  queryTree: QueryTree;
  fields?: Fields[];
}) => (qb: QueryBuilder) => {
  const qt = new QueryTree().buildTree(model, fields).buildJoins(qb);

  qb.andWhere((qb) =>
    qt.buildWhereClauses({
      model,
      params,
      qb,
      fields,
    }),
  );
};

function getJoinTable(collectionName: string) {
  return `${collectionName}_components`;
}

/**
 * Build Join for ComponentsJoinModel, in relation many to many or similar
 * need to have third table for example articles_components or pages_components
 */
export const buildComponentsJoin = ({
  qb,
  model,
}: {
  qb: QueryBuilder;
  model: Model;
}) => {
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
 * for example when articles has relation to component Paragraphs -> build left join to components_paragraphs
 */
export const buildComponentsTargetJoin = ({
  qb,
  model,
  joinTable,
}: {
  qb: QueryBuilder;
  model: Model;
  joinTable: string;
}) => {
  const { collectionName, primaryKey } = model;

  qb.leftJoin(collectionName, (_qb) => {
    _qb
      .on(`${joinTable}.component_id`, '=', `${collectionName}.${primaryKey}`)
      .andOn(
        `${joinTable}.component_type`,
        '=',
        global.strapi.connections.default.raw(`'${collectionName}'`),
      );
  });
};

const buildWhereClauses = ({
  model,
  qb,
  params,
}: {
  qb: QueryBuilder;
  model: Model;
  params: Record<string, string>;
}) => {
  const { attributes } = model;
  const componentModels = getSearchableComponents(attributes);

  buildSearchQuery({
    model,
    qb,
    params,
  });
  componentModels.forEach((componentModel) => {
    buildWhereClauses({
      model: componentModel,
      qb,
      params,
    });
  });
};
