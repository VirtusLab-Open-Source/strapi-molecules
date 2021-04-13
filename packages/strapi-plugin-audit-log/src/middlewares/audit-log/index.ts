import { Context, Next } from 'koa';
import { MiddlewareConfig, Strapi } from 'strapi-types';
import { createDecorate, getService } from './util';
import forEach from 'lodash/forEach';
import {
  AuditLogMiddleware,
  KoaContext,
  ServiceConfig,
  SupportMethods,
} from './types';

class AuditLog {
  private readonly _strapi: Strapi;

  constructor(strapi: Strapi) {
    this._strapi = strapi;
  }

  get strapi() {
    if (!this._strapi) {
      throw new Error('Strapi instance not given');
    }
    return this._strapi;
  }

  get config() {
    return (
      (this.strapi.config.middleware.settings['audit-log'] as MiddlewareConfig<
        AuditLogMiddleware
      >) || { map: [] }
    );
  }

  get endpoints() {
    return (this.config.map || []).map((_) => _.pluginName);
  }

  get methods(): SupportMethods[] {
    return this.config.methods || ['POST', 'PUT', 'DELETE'];
  }

  get exclude() {
    return this.config.exclude || [];
  }

  get plugins() {
    return this.strapi.plugins;
  }

  getPlugin(pluginName: string) {
    return this.plugins[pluginName];
  }

  getController({ pluginName, controllerName }: ServiceConfig) {
    const plugin = this.getPlugin(pluginName);
    return plugin.controllers[controllerName];
  }

  getService({ pluginName, serviceName }: ServiceConfig) {
    const plugin = this.getPlugin(pluginName);
    return plugin.services[serviceName];
  }

  setService({ pluginName, serviceName }: ServiceConfig, service: any) {
    const plugin = this.getPlugin(pluginName);
    return (plugin.services[serviceName] = service);
  }

  condition(ctx: KoaContext) {
    if (ctx) {
      const { method, url } = ctx;
      return (
        this.methods.includes(method) &&
        this.exclude.every((_) => !url.startsWith(`/${_}`)) &&
        this.endpoints.some((_) => url.startsWith(`/${_}`))
      );
    }
  }

  getEndpointConfig(ctx: KoaContext) {
    if (ctx) {
      const url = ctx.url || '';
      return this.config.map.find((_) => url.startsWith(`/${_.pluginName}`));
    }
  }

  initialize() {
    this.config.map.forEach((config) => {
      const controller = this.getController(config);
      forEach(controller, (originalFunction, key) => {
        if (typeof originalFunction === 'function') {
          controller[key] = (ctx: KoaContext) => {
            const endpointConfig = this.getEndpointConfig(ctx);
            if (endpointConfig && this.condition(ctx)) {
              ctx.auditLog = getService(
                endpointConfig,
                this.strapi,
                ctx.state.user,
              );
            }
            return originalFunction.call(controller, ctx);
          };
        }
      });
    });
    this.strapi.app.use(async (ctx: Context, next: Next) => {
      if (this.condition(ctx as KoaContext)) {
        const endpointConfig = this.getEndpointConfig(ctx as KoaContext);
        if (endpointConfig) {
          const service = this.getService(endpointConfig);
          if (endpointConfig.decorate) {
            const wrapper = createDecorate(ctx, service);
            this.setService(endpointConfig, wrapper);
          }
          await next();
          if (ctx.auditLog) {
            // handle sync errors
            try {
              // run does not have to return a promise
              (ctx as KoaContext).auditLog
                ?.run(ctx.method, ctx as KoaContext, endpointConfig)
                ?.catch((error) => {
                  this.strapi.log.error(
                    `Error on create audit log: ${error.message}`,
                    error.stack,
                  );
                });
            } catch (error) {
              this.strapi.log.error(
                `Error on create audit log: ${error.message}`,
                error.stack,
              );
            }
          }
          if (endpointConfig.decorate) {
            this.setService(endpointConfig, service);
          }
          return;
        }
        await next();
      } else {
        await next();
      }
    });
  }
}

module.exports = (strapi: Strapi) => new AuditLog(strapi);
