import { Model } from '../schemas';

type Plugin = any;
type Filter = any;

type Association = {
  alias: string;
  type: string;
  model: string;
  via: string | undefined;
  nature: 'oneWay' | string;
  autoPopulate: boolean;
  dominant: boolean;
  plugin: Plugin | undefined;
  filter: Filter | undefined;
};
type AsyncFunction = <T extends { id: string }>(p: any) => Promise<null | T>;
type AsyncFunctionMultiple = <T extends { id: string }>(p: any) => Promise<null | T[]>;

export type StrapiGlobalQuery = (s: string) => GlobalQueryResult | undefined;

export type GlobalQueryResult = {
  model: Model;
  orm: 'bookshelf' | 'mongoose';
  primaryKey: 'id' | string;
  associations: Association[];
  custom: unknown;
  create: AsyncFunction;
  createMany: any;
  update: AsyncFunction;
  delete: AsyncFunction;
  find: AsyncFunctionMultiple;
  findOne: AsyncFunction;
  count: AsyncFunction;
  search: AsyncFunctionMultiple;
  countSearch: AsyncFunction;
  findPage: AsyncFunctionMultiple;
  searchPage: AsyncFunctionMultiple;
};
