import { Model as BookshelfModel } from 'bookshelf';

type PluginsCustomConfigurations = {
  searchable?: boolean;
};

export type ComponentAttribute = PluginsCustomConfigurations & {
  type: 'component';
  repeatable: boolean;
  component: string;
};

export type DynamicZoneAttribute = PluginsCustomConfigurations & {
  type: 'dynamiczone';
  components: string[];
  max: number;
  min: number;
};

export type RelationAttribute = PluginsCustomConfigurations & {
  model: string;
  columnName?: string;
  configurable?: false;
  hidden?: true;
  via?: string;
};

export type ToManyRelationAttribute = PluginsCustomConfigurations & {
  collection: string;
  attribute: string;
  column: string;
};

type PrimitiveTypeAttribute = PluginsCustomConfigurations & {
  type: string;
};

export type Attribute =
  | PrimitiveTypeAttribute
  | ComponentAttribute
  | DynamicZoneAttribute
  | RelationAttribute
  | ToManyRelationAttribute;

export type Model = BookshelfModel<any> & {
  collectionName: string;
  kind: 'singleType' | 'collectionType'
  modelName: string;
  databaseName: string;
  primaryKey: string;
  componentsJoinModel: { foreignKey: string } & Model;
  uid: string;
  options: Record<string, any>;
  allAttributes: Record<string, Attribute>;
  attributes: Record<string, Attribute>;
  associations: Association[];
};
export type ModelAssociation = {
  alias: string;
  type: 'model' | 'collection';
  model: string;
  via: string;
  nature: string;
  dominant: boolean;
};
export type CollectionAssociation = {
  alias: string;
  type: 'model' | 'collection';
  collection: string;
  tableCollectionName: string;
  via: string;
  nature: string;
  dominant: boolean;
};
export type Association = CollectionAssociation | ModelAssociation;
