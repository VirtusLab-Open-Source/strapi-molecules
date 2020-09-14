import { Model } from "../schemas";

type Plugin = any;
type Filter = any;

type Association = {
  alias: string;
  type: string;
  model: string;
  via: string | undefined;
  nature: "oneWay" | string;
  autoPopulate: boolean;
  dominant: boolean;
  plugin: Plugin | undefined;
  filter: Filter | undefined;
};
type AsyncFunction = (p: any) => Promise<any>;

export type StrapiGlobalQuery = (s: string) => GlobalQueryResult | undefined;

export type GlobalQueryResult = {
  model: Model;
  orm: "bookshelf" | "mongoose";
  primaryKey: "id" | string;
  associations: Association[];
  custom: unknown;
  create: AsyncFunction;
  createMany: any;
  update: AsyncFunction;
  delete: AsyncFunction;
  find: AsyncFunction;
  findOne: AsyncFunction;
  count: AsyncFunction;
  search: AsyncFunction;
  countSearch: AsyncFunction;
  findPage: AsyncFunction;
  searchPage: AsyncFunction;
};
