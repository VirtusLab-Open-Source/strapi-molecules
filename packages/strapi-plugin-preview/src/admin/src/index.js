import { noop } from 'lodash';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import trads from './translations';
import Initializer from './containers/Initializer';

export default (strapi) => {
  const pluginDescription =
    pluginPkg.strapi.description || pluginPkg.description;
  const { icon, name } = pluginPkg.strapi;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    icon,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: pluginPkg.strapi.required || false,
    layout: null,
    lifecycles: noop,
    leftMenuLinks: [],
    leftMenuSections: [],
    mainComponent: null,
    name,
    preventComponentRendering: false,
    trads,
  };

  return strapi.registerPlugin(plugin);
};
