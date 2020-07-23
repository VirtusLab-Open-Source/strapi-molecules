const getAsyncSearchableData = async (contentType, searchQuery) => {
  const result = await strapi.query(contentType).search({ _q: searchQuery });
  return result.map(item => ({ ...item, __contentType: contentType }));
};

module.exports = {
  fetchAsyncSearchableData: async (contentTypes, searchQuery) => {
    const requests = contentTypes.map(contentType => {
      return getAsyncSearchableData(contentType, searchQuery);
    });
    return Promise.all(requests);
  }
};
