import { flatten } from 'lodash';
import { search } from 'strapi-deepsearch-service';

type QueryParams = {
  _q: string;
  [key: string]: string;
};

const getAsyncData = async (contentType: string, params: QueryParams) => {
  const model = global.strapi.query(contentType)?.model;
  if (model) {
    const result = await search(model, params);

    return result.map((item: any) => ({ ...item, __contentType: contentType }));
  }
  return undefined;
};

const fetchData = async (contentTypes: string[], params: QueryParams) => {
  const requests = contentTypes.map((contentType) => {
    return getAsyncData(contentType, params);
  });
  return Promise.all(requests).then(flatten);
};

module.exports = {
  fetchData,
  getAsyncData,
};
