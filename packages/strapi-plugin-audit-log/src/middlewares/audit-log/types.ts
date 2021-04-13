import { Context } from 'koa';
import { Base } from '../../lib/services/Base';

export type RequestMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT';
export type SupportMethods = Exclude<RequestMethod, 'GET' | 'HEAD' | 'PATCH'>;
export type User = {
  readonly id: number | string;
  readonly firstname: string;
  readonly lastname: string;
  readonly username: string;
  readonly email: string;
};

export type KoaContext<T = any> = Context & {
  auditLog?: Base<T>;
  method: SupportMethods;
};
export type ServiceConfig<T = any> = {
  readonly pluginName: string;
  readonly serviceName: string;
  readonly controllerName: string;
  readonly Class?: Base<T>;
  readonly decorate?: boolean;
};

export type AuditLogMiddleware = {
  readonly map: ServiceConfig[];
  readonly methods?: SupportMethods[];
  readonly exclude?: string[];
};
