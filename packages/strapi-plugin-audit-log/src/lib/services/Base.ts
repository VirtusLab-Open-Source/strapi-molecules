import { EventEmitter } from 'events';
import { Strapi } from 'strapi-types';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import isObject from 'lodash/isObject';
import get from 'lodash/get';
import deepDiff, { Diff } from 'deep-diff';

import { KoaContext, ServiceConfig, User } from '../../middlewares/audit-log/types';
import { AvailableAction } from '..';

export abstract class Base<T extends Object = any> extends EventEmitter {
  protected strapi: Strapi;
  protected user: User;
  protected entities: Record<string, T> = {};
  protected actionType: AvailableAction | undefined;

  protected constructor(strapi: Strapi, user: User) {
    super();
    this.strapi = strapi;
    this.user = user;
  }

  add(key: string, data: T) {
    this.entities[key] = data;
  }

  protected getUserId(): string | number {
    return get(this.user, 'id');
  }

  private clearObject(entity: T) {
    if (Array.isArray(entity)) {
      this.clearEntities(entity as unknown as Record<string, T>);
    }
    for (let key in entity) {
      if (entity.hasOwnProperty(key) && key.endsWith('_by') || key.endsWith('_at')) {
        delete entity[key];
      }
      if (entity.hasOwnProperty(key) && isObject(entity[key])) {
        this.clearObject(entity[key] as unknown as T);
      }
    }
  }

  private clearEntities(entities: Record<string, T>) {
    forEach(entities, (entity) => {
      this.clearObject(entity);
    });
    return entities;
  }

  protected sanitize(entities: Record<string, T>) {
    const data = cloneDeep(entities);
    return this.clearEntities(data);
  }

  protected getDiff(oldEntity: any, newEntity: any): Array<Diff<any, any>> | undefined {
    return deepDiff.diff(oldEntity, newEntity);
  }

  protected save(originalId: string | number, actionType: AvailableAction, originalModelName: string, content: any) {
    if (content) {
      const service = get(this.strapi, 'plugins.audit-log.services.auditlog');
      if (service) {
        return service.create(originalId, this.getUserId(), actionType, originalModelName, content);
      }
      this.strapi.log.error('Audit log service not exist');
    }
  }

  abstract async run(method: string, ctx: KoaContext, config: ServiceConfig): Promise<void>;

}
