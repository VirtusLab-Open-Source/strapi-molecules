import { App } from "./containers/App";
import pluginPkg from "../../../package.json";
// import Initializer from './containers/Initializer';
import lifecycles from "./lifecycles";

const strapi = (): any => {
  const pluginDescription = pluginPkg.description;

  // const icon = pluginPkg.strapi.icon;
  const name = pluginPkg.name;
  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    // icon,
    id: "versioning",
    // initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    // pluginLogo,
    preventComponentRendering: false,
    // trads,
    menu: {
      pluginsSectionLinks: [
        {
          destination: `/plugins/versioning`,
          // icon,
          name,
          label: {
            id: `versioning.plugin.name`,
            defaultMessage: "COMMENTS",
          },
          // permissions: pluginPermissions.main,
        },
      ],
    },
  };

  return global.strapi.registerPlugin(plugin);
};

export default strapi;
