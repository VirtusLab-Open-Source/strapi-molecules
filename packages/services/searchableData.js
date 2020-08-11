const getAsyncSearchableData = async (contentType, _q) => {
  const result = await strapi.query(contentType).search({ _q });
  return result.map(item => ({ ...item, __contentType: contentType }));
};

module.exports = {
  fetchAsyncSearchableData: async (contentTypes, _q) => {
    const requests = contentTypes.map(contentType => {
      return getAsyncSearchableData(contentType, _q);
    });
    return Promise.all(requests);
  }
};
