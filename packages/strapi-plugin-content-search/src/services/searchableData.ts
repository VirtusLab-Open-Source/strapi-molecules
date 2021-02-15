import { flatten } from 'lodash';
import { search } from 'strapi-deepsearch-service';

type QueryParams = Record<string, string> & {
  _q: string;
};

export const searchSingleContentType = async (
  contentType: string,
  params: QueryParams,
  populate?: (string | object)[],
  fields?: Fields[],
) => {
  const model = global.strapi.query(contentType)?.model;
  if (model) {
    const result = await search(model, params, populate, fields);

    return result.map((item: any) => ({
      ...item,
      __contentType: contentType,
    }));
  }
  return undefined;
};

export const searchContentTypes = (
  contentTypes: string[],
  params: QueryParams,
) => {
  const requests = contentTypes.map((contentType) => {
    return searchSingleContentType(contentType, params);
  });
  return Promise.all(requests).then(flatten);
};
type Fields = {
  name: string;
  fields?: Fields;
};
type ContentType = {
  contentType: string;
  fields?: Fields[];
};
export const getFieldsToSearch = (contentTypes: ContentType[]) => {
  return contentTypes.filter(
    (data) => global.strapi.contentTypes[data.contentType]?.options.searchable,
  );
};

export const searchByFields = (
  contentTypes: ContentType[],
  query: QueryParams,
) => {
  const contentTypesWithFields = contentTypes.map((c) =>
    searchSingleContentType(c.contentType, query, undefined, c.fields),
  );
  return Promise.all(contentTypesWithFields).then(flatten);
};
