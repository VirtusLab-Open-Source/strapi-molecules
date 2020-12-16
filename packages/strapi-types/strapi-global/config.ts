type MiddlewareName = string;
export type MiddlewareConfig<T = any> = T & {
  enabled: boolean;
};
export type Middleware = {
  timeout: number;
  load?: {
    before?: string[];
    order?: string[];
    after?: string[];
  };
  settings: Record<MiddlewareName, MiddlewareConfig>;
};

export type StrapiGlobalConfig = {
  get: <T extends any>(s: string) => T;
  middleware: Middleware;
  plugins: Record<string, any>;
};
