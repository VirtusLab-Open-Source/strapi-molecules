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

type BaseModel = {
  options: {
    [key: string]: any;
  };
  allAttributes: {
    [key: string]: ModelAttribute;
  };
};

export type Model = {
  collectionName: string;
  uid: string;
};

export type ComponentModel = BaseModel & {};

type Entity = {
  [key: string]: Model;
};

export type Plugin = {
  [key: string]: any;
};

export class Strapi {
  components: {
    [key: string]: ComponentModel;
  } = {};
  plugins: Plugin = {};
  contentTypes: {
    [key: string]: any;
  } = {};
  query = (s: string): Entity => ({
    fakeModel: {
      collectionName: s,
      uid: "uid",
    },
  });
  connections: {
    default: typeof Knex;
  } = { default: Knex };
  models: {
    [key: string]: Model;
  } = {};
  db: any = {};
  app: {
    use: (x: (ctx: Context, next: Next) => Promise<any>) => void;
  } = { use: (callback) => callback };
}
