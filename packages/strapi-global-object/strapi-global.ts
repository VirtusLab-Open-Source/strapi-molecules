import knex from "knex";

const strapiObject = {
  plugins: {},
  components: {},
  contentTypes: {},
  query: (s: any) => s,
  models: {},
  connections: {
    default: knex,
  },
  db: {},
  app: {
    use: (x: any) => x,
  },
};

module.exports = {
  strapiObject,
};
