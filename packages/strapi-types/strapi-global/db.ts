export type StrapiGlobalDB = {
  query: (uid: string) => any;
  getModel: (modelName: string) => any;
};
