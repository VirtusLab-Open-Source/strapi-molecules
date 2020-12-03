import { QueryBuilder } from 'knex';
import { isEmpty } from 'lodash';
import { Model } from 'strapi-types';

import { buildSearchQuery } from './build-search-query';
import { getSearchableComponents } from './models-utils';

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

  buildTree(model: Model) {
    const {
      collectionName,
      primaryKey,
      attributes,
      componentsJoinModel,
    } = model;
    const componentModels = getSearchableComponents(attributes);
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
    return this;
  }

  findByJoinTable(joinTable: string) {
    return this.tree.find((leaf) => leaf.joinTable === joinTable);
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
  }: {
    qb: QueryBuilder;
    model: Model;
    params: Record<string, string>;
  }) {
    const { attributes } = model;
    const componentModels = getSearchableComponents(attributes);

    buildSearchQuery({ model, qb, params });
    componentModels.forEach((componentModel) => {
      this.buildWhereClauses({ model: componentModel, qb, params });
    });

    return this;
  }
}

export const buildDeepSearch = ({
  model,
  params,
}: {
  model: Model;
  params: Record<string, string>;
  queryTree: QueryTree;
}) => (qb: QueryBuilder) => {
  const qt = new QueryTree().buildTree(model).buildJoins(qb);
  qb.andWhere((qb) => qt.buildWhereClauses({ model, params, qb }));
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
 * for example when articles has relation to component Paragram -> build left join to components_paragraphs
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

  buildSearchQuery({ model, qb, params });
  componentModels.forEach((componentModel) => {
    buildWhereClauses({ model: componentModel, qb, params });
  });
};
