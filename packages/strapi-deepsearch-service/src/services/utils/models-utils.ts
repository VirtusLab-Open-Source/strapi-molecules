import _ from 'lodash';
import {
  ComponentAttribute,
  DynamicZoneAttribute,
  Attribute,
  RelationAttribute,
  ToManyRelationAttribute,
  Association,
  CollectionAssociation,
  ModelAssociation,
} from 'strapi-types';
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

export function isToManyRelation(
  attr: Attribute,
): attr is ToManyRelationAttribute {
  return typeof (attr as any).collection === 'string';
}

export function isRelation(attr: Attribute): attr is RelationAttribute {
  return typeof (attr as any).model === 'string';
}

export function isCollectionAssoc(
  assoc: Association,
): assoc is CollectionAssociation {
  return typeof (assoc as any).collection === 'string';
}

export function isModelAssoc(assoc: Association): assoc is ModelAssociation {
  return typeof (assoc as any).model === 'string';
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

export function getSearchableComponents(attributes: Record<string, Attribute>) {
  const attrs = Object.values(attributes).filter((attr) => attr.searchable);
  const componentNames = getComponentsFromAttributes(attrs);
  return componentNames
    .map((componentName) => global.strapi.components[componentName])
    .filter(isModelSearchable);
}

function getRelationModels(attrs: Attribute[]) {
  const toManyModels = attrs
    .filter(isToManyRelation)
    .map((attr) => global.strapi.models[attr.collection]);
  const relationModels = attrs
    .filter(isRelation)
    .map((attr) => global.strapi.models[attr.model]);
  return [...toManyModels, ...relationModels];
}

export function getSearchableModels(attributes: Record<string, Attribute>) {
  const attrs = Object.values(attributes).filter((attr) => attr.searchable);
  const componentModels = getComponentsFromAttributes(attrs)
    .map((componentName) => global.strapi.components[componentName])
    .filter(isModelSearchable);
  const relationModels = getRelationModels(attrs);
  return {
    componentModels,
    relationModels,
  };
}
