const { get } = require("lodash");

module.exports = async () => {
  const seedServices = global.strapi.plugins["seeds"].services;
  const seedDir =
    get(global.strapi, "config.custom.seedsDir") ||
    get(global.strapi, "config.seedsDir") ||
    "seeds";
  await seedServices["create-seed-table"].create();
  await seedServices.seeds.generateFromDir(seedDir);
};
