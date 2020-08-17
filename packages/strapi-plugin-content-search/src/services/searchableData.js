const getAsyncData = async (contentType, _q) => {
  const result = await strapi.query(contentType).search({ _q });
  return result.map((item) => ({ ...item, __contentType: contentType }));
};

const fetchAsyncData = async (contentTypes, _q) => {
  const requests = contentTypes.map((contentType) => {
    return getAsyncSearchableData(contentType, _q);
  });
  return Promise.all(requests);
};

module.exports = {
  fetchAsyncData,
  getAsyncData,
};
