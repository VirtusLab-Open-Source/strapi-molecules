import {
  ComponentAttribute,
  DynamicZoneAttribute,
  Attribute,
} from 'strapi-types';
import _ from 'lodash';
import { isModelSearchable } from './component-utils';

export function isDynamicZoneAttribute(
  attr: Attribute,
): attr is DynamicZoneAttribute {
  return (attr as any).type === 'dynamiczone';
}

export function isComponentAttribute(
  attr: Attribute,
): attr is ComponentAttribute {
  return (attr as any).type === 'component';
}

export function getComponentsFromAttributes(attrs: Attribute[]) {
  const components: string[] = [];
  attrs.forEach((attr) => {
    if (isComponentAttribute(attr)) {
      components.push(attr.component);
    } else if (isDynamicZoneAttribute(attr)) {
      components.push(...attr.components);
    }
  });
  return _.uniq(components);
}

export function getSearchableComponents(attributes: {
  [key: string]: Attribute;
}) {
  const attrs = Object.values(attributes).filter((attr) => attr.searchable);
  const componentNames = getComponentsFromAttributes(attrs);
  return componentNames
    .map((componentName) => global.strapi.components[componentName])
    .filter(isModelSearchable);
}
