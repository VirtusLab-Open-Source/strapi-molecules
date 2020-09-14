module.exports = async () => {
  // Check if the plugin users-permissions is installed because the comments needs it
  if (Object.keys(global.strapi.plugins).indexOf("users-permissions") === -1) {
    throw new Error(
      "In order to make the comments plugin work the users-permissions plugin is required",
    );
  }

  // Add permissions
  const actions = [
    {
      section: "plugins",
      displayName: "Access the Preview",
      uid: "read",
      pluginName: "preview",
    },
  ];

  const { actionProvider } = global.strapi.admin.services.permission;
  actionProvider.register(actions);
};
