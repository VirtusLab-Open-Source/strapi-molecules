import { Context, Next } from "koa";

export type StrapiGlobalApp = {
  use: (x: (ctx: Context, next: Next) => Promise<any>) => void;
};
