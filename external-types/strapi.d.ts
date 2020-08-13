import type { Strapi } from "@strapi-molecules/strapi-types";
declare global {
  module NodeJS {
    interface Global {
      strapi: Strapi;
    }
  }
}
