const isModelComponent = (model, part) => {
  const attribute = model.allAttributes[part];
  if (attribute && attribute.type === 'component') {
    return !!strapi.components[attribute.component];
  }
  return false;
};
const isDynamicZone = (model, part) => {
  const attribute = model.allAttributes[part];
  return attribute && attribute.type === 'dynamiczone';
};

const isModelComponentSearchable = (model, componentName) => {
  const attribute = model.allAttributes[componentName];
  if (attribute && attribute.type === 'component') {
    const componentModel = strapi.components[attribute.component];
    return isModelSearchable(componentModel);
  }
  return false;
};

const getComponentByModel = (model, part) => {
  const attribute = model.allAttributes[part];
  return attribute ? strapi.components[attribute.component] : undefined;
};

const isModelSearchable = (model) => {
  return model && model.options.searchable;
};

const isModelAttrSearchable = (model, attr) => {
  return model._attributes[attr] && model._attributes[attr].searchable;
};

module.exports = {
  isModelComponent,
  isDynamicZone,
  getComponentByModel,
  isModelComponentSearchable,
  isModelSearchable,
  isModelAttrSearchable,
};
