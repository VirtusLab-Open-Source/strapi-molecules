import type { StrapiGlobal } from "strapi-types";
declare global {
  module NodeJS {
    interface Global {
      strapi: StrapiGlobal;
    }
  }
}
