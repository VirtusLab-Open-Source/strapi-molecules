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

type PrimitiveTypeAttribute = PluginsCustomConfigurations & {
  type: string;
};

export type Attribute =
  | PrimitiveTypeAttribute
  | ComponentAttribute
  | DynamicZoneAttribute
  | RelationAttribute;

export type Model = BookshelfModel<any> & {
  collectionName: string;
  primaryKey: string;
  componentsJoinModel: { foreignKey: string } & Model;
  uid: string;
  options: Record<string, any>;
  allAttributes: Record<string, Attribute>;
  attributes: Record<string, Attribute>;
};
