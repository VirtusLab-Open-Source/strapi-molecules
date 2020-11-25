type SearchParams = {
  params: Record<string, any>
};
type ModelName = {
  model: string
};

type AdditionalData = ModelName & {
  source?: string;
}

type SearchConfig = SearchParams & {
  populate: boolean
};

export type EntityService<T = any> = {
  uploadFiles(entry: T, files: File[], { model, source }: AdditionalData): Promise<any>;
  find(searchConfig: SearchConfig, { model }: AdditionalData): Promise<T>;
  findOne(searchConfig: SearchConfig, additionalData: AdditionalData): Promise<T>;
  count(searchConfig: Omit<SearchConfig, 'populate'>, additionalData: AdditionalData): Promise<T>;
  create({ data, files }: { data: T, files?: File[] }, additionalData: AdditionalData): Promise<T>;
  update({ params, data, files }: { params: Record<string, any>, data: T, files: File[] }, { model }: ModelName): Promise<T>
  delete({ params }: SearchParams, { model }: ModelName): Promise<T>
  search({ params }: Record<string, any>, { model }: ModelName): Promise<T[]>
  countSearch({ params }: SearchParams, { model }: ModelName): Promise<number>
}
