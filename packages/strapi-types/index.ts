import Knex from "knex";
import { Context, Next } from "koa";

type ComponentAttribute = {
  type: "component";
  repeatable: boolean;
  component: string;
};
type PrimitiveTypeAttribute = {
  type: string;
};

type ModelAttribute = PrimitiveTypeAttribute | ComponentAttribute;

export type Model = {
  collectionName: string;
  uid: string;
  options: {
    [key: string]: any;
  };
  allAttributes: {
    [key: string]: ModelAttribute;
  };
};

export type ComponentModel = Model & {};

type Db = {
  query: any;
  getModel: any;
};

export type Plugin = {
  [key: string]: any;
};

export type ContentType = any;

export class Strapi {
  components: {
    [key: string]: ComponentModel;
  } = {};
  plugins: Plugin = {};
  contentTypes: {
    [key: string]: ContentType;
  } = {};
  connections: {
    default: typeof Knex;
  } = { default: Knex };
  models: {
    [key: string]: Model;
  } = {};
  app: {
    use: (x: (ctx: Context, next: Next) => Promise<any>) => void;
  } = { use: (callback) => callback };
}

export type StrapiGlobal = Strapi & {
  db: Db;
  query: () => any;
};
