'use strict';
const { sanitizeEntity } = require('strapi-utils');

const PreviewError = require('./preview-error');

module.exports = {
  async findOne(
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

    return sanitizeEntity(contentPreview, { model });
  },

  getPreviewUrl(
    contentType: string,
    contentId: string,
    _query: Record<string, string | number>,
  ) {
    const previewUrl =
      global.strapi.config.get('plugins.preview.previewUrl') || '';
    const publicationState = global.strapi.config.get(
      'plugins.preview.publicationState',
    );

    return `${this.replacePreviewParams(contentType, contentId, previewUrl)}${
      publicationState ? `?_publicationState=${publicationState}` : ''
    }`;
  },

  replacePreviewParams(contentType: string, contentId: string, url: string) {
    return url.replace(':contentType', contentType).replace(':id', contentId);
  },
};
