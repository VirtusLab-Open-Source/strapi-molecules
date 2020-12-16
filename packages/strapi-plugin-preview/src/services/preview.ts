'use strict';
const { sanitizeEntity } = require('strapi-utils');

const PreviewError = require('./preview-error');

const getTemplateComponentFromTemplate = (
  template: { __component: string }[],
) => {
  if (template && template[0] && template[0].__component) {
    const componentName = template[0].__component;
    return global.strapi.components[componentName];
  }
  throw new PreviewError(400, 'Template field is incompatible');
};

module.exports = {
  isPreviewable: async function (contentType: string) {
    const model = await global.strapi.query(contentType)?.model;

    if (model) {
      return model.options.previewable;
    }
    throw new PreviewError(400, 'Wrong contentType');
  },

  findOne: async function (
    contentType: string,
    id: string,
    query: Record<string, string>,
  ) {
    const service = global.strapi.services[contentType];
    const model = global.strapi.models[contentType];
    if (!service) {
      throw new PreviewError(400, 'Wrong contentType');
    }
    if (!model.options.previewable) {
      throw new PreviewError(400, 'This content type is not previewable');
    }
    const contentPreview = await service.findOne({
      ...query,
      id,
    });

    if (!contentPreview) {
      throw new PreviewError(
        404,
        'Preview not found for given content type and Id',
      );
    }
    const data = sanitizeEntity(contentPreview, { model });
    const templateComponent = getTemplateComponentFromTemplate(data.template);

    return {
      templateName: templateComponent.options.templateName,
      contentType,
      data,
    };
  },

  getPreviewUrl: function (contentType: string, contentId: string) {
    const previewUrl = global.strapi.config.get('custom.previewUrl') || '';

    return this.replacePreviewParams(contentType, contentId, previewUrl);
  },

  replacePreviewParams: function (
    contentType: string,
    contentId: string,
    url: string,
  ) {
    return url.replace(':contentType', contentType).replace(':id', contentId);
  },

  getTenantUrlByTenantKey: function (key: string) {
    return (
      global.strapi.config
        .get<{ key: string; previewUrl: string }[]>('custom.tenants')
        ?.find((t) => t.key === key)?.previewUrl || ''
    );
  },

  getTenantUrl: function (
    { key }: { key: string },
    contentType: string,
    contentId: string,
  ) {
    const previewUrl = this.getTenantUrlByTenantKey(key);

    return this.replacePreviewParams(contentType, contentId, previewUrl);
  },
};
