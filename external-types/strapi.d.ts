import type { Strapi } from "strapi-types";
declare global {
  module NodeJS {
    interface Global {
      strapi: Strapi;
    }
  }
}
