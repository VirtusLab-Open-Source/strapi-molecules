module.exports = async () => {
  await global.strapi.plugins["versioning-plugin"].services[
    "create-versions-table"
  ].createVersionsTable();
};
