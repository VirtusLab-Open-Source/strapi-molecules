import { Context } from 'koa';
import { Strapi } from 'strapi-types';
import { ServiceConfig, User } from './types';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import { Base, ContentManager } from '../../lib/services';


const map: Record<string, typeof Base> = {
  'contentmanager': ContentManager,
};

export const getService = ({ serviceName, Class }: ServiceConfig, strapi: Strapi, user: User): Base => {
  const Draft: any = Class || get(map, serviceName);
  return Draft ? new Draft(strapi, user) : { run: () => {} };
};

export const createDecorate = (ctx: Context, service: any) => {
  const serviceCopy: Record<string, (...args: any[]) => Promise<any>> = {};
  forEach(service, (originalFunction: (...args: any[]) => Promise<any>, key: string) => {
    serviceCopy[key] = async (...args) => {
      const result = await originalFunction.apply(service, args);
      if (ctx.auditLog) {
        ctx.auditLog.add(key, result);
      }
      return result;
    };
  });
  return serviceCopy;
};
