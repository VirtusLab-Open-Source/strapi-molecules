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

type Model = {
  collectionName: string;
  uid: string;
};

type ComponentModel = BaseModel & {};

export type Strapi = {
  components: {
    [key: string]: ComponentModel;
  };
  plugins: {
    [key: string]: any;
  };
  contentTypes: {
    [key: string]: any;
  };
  query: (s: string) => any;
  connections: {
    default: Knex;
  };
  models: {
    [key: string]: Model;
  };
  db: any;
  app: {
    use: (x: (ctx: Context, next: Next) => Promise<any>) => any;
  };
};
