const isModelComponent = (model, part) => {
  const attribute = model.allAttributes[part];
  if (attribute && attribute.type === "component") {
    return !!strapi.components[attribute.component];
  }
  return false;
};

const isModelComponentSearchable = (model, componentName) => {
  const attribute = model.allAttributes[componentName];
  if (attribute && attribute.type === "component") {
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

module.exports = {
  isModelComponent,
  getComponentByModel,
  isModelComponentSearchable,
  isModelSearchable,
};
