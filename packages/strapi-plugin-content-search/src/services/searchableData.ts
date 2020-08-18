import deepsearch from "@strapi-molecules/deepsearch-service";

const getAsyncData = async (contentType: string, _q: string) => {
  const model = global.strapi.query(contentType);
  const result = await deepsearch.search(model, { _q });
  return result.map((item: any) => ({ ...item, __contentType: contentType }));
};

const fetchAsyncData = async (contentTypes: string[], _q: string) => {
  const requests = contentTypes.map((contentType) => {
    return getAsyncData(contentType, _q);
  });
  return Promise.all(requests);
};

module.exports = {
  fetchAsyncData,
  getAsyncData,
};
