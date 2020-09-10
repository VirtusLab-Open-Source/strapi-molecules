module.exports = async () => {
  await global.strapi.plugins["versioning"].services[
    "create-versions-table"
  ].createVersionsTable();
};
