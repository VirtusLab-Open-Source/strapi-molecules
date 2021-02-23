# Strapi - Audit log

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
searching across content types fields which have searchable property.

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-audit-log
```

### Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.3.4 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested
nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features
## Config
- Config in `config/middleware.js` we have to set:
```js
 'audit-log': {
      enabled: true,
      exclude: []
      map: [
        {
          pluginName: 'content-manager',
          serviceName: 'contentmanager',
          decorate: boolean,
          
          Class: ExampleClass,
          fetchSingle: 'methodName',
        },
      ]
    },
```
where:
- `enabled` - to enable that middleware and plugin
- `map` - contain configs which endpoint should handle by `audit-log` middleware
    - `pluginName` - plugin name which have log for this endpoint to it from `strapi` object, and first part url to requests
    - `serviceName` - service which on have business logic for this plugin
    - `decorate` - boolean which told audit log which path should be use to handle changes events or service decorate
      if we set it to true we should return from service new entity to compare to old one handled and cached by audit log,
      otherwise we should provide `Class` property where we can handle events from our service example for [navigation](https://github.com/VirtusLab/strapi-plugin-navigation/blob/master/examples/audit-log-integrations.js.md)
    - `fetchSingle` - method to fetch a single entity to compare snapshot for REST API, audit log will paste entityId as parameter
    - `Class` - a class which one handle `audit-log` logic, should extend `Base` class from this plugin this class have to implement method `run` which one will be call
    after finish other middlewares, this method have signature:
    ```
       abstract async run(method: string, ctx: KoaContext, config: ServiceConfig): Promise<void>;
    ```
    and in this method we should call `save` from `Base` class to save data in a database:
    ```
        await this.save(
          cleaningData.delete.id,
          AvailableAction.DELETE,
          ctx.params.model,
          diffs,
        );
    ```
    we can set couple types actions:
    ```ts
        export enum AvailableAction {
          CREATE = 'CREATE',
          UPDATE = 'UPDATE',
          DELETE = 'DELETE',
          // for batch actions
          UPDATE_REMOVE = 'UPDATE_REMOVE',
          UPDATE_CREATE = 'UPDATE_CREATE',
          CREATE_UPDATE = 'CREATE_UPDATE',
          CREATE_REMOVE = 'CREATE_REMOVE',
          REMOVE_UPDATE = 'REMOVE_UPDATE',
          REMOVE_CREATE = 'REMOVE_CREATE',
          CREATE_UPDATE_REMOVE = 'CREATE_UPDATE_REMOVE',
          CREATE_REMOVE_UPDATE = 'CREATE_REMOVE_UPDATE',
          UPDATE_CREATE_REMOVE = 'UPDATE_CREATE_REMOVE',
          UPDATE_REMOVE_CREATE = 'UPDATE_REMOVE_CREATE',
          REMOVE_UPDATE_CREATE = 'REMOVE_UPDATE_CREATE',
          REMOVE_CREATE_UPDATE = 'REMOVE_CREATE_UPDATE',
        }

    ```
    - `fetchSingle` - method name from service which one we can use to fetch full entity to get, we need this to create snapshots 
    - `decorate` - flag for audit log how we collect data, with this flag audit log will decorate our service and save results from service methods in `entities` to compare changes
    
- It will create a collection `audit_log` in a database where we can find information about the changes out model in the database, by default, we support the `content-manager` plugin.
- We can fetch information about available versions some entity via endpoint:
```
/audit-log?model={ourModelName}&id={entityId}
```
Example response:
```json
REQUEST: GET http://HOST/audit-log?model=example&id=1
RESPONSE:
{
    "results": [
        {
            "id": 13,
            "originId": "1",
            "modelName": "example",
            "action": "UPDATE",
            "timestamp": "2020-11-09T09:31:42.105Z"
        },
        {
            "id": 14,
            "originId": "1",
            "modelName": "example",
            "action": "UPDATE",
            "timestamp": "2020-11-09T09:31:52.497Z"
        },
        {
            "id": 15,
            "originId": "1",
            "modelName": "example",
            "action": "UPDATE",
            "timestamp": "2020-11-09T09:47:19.830Z"
        }
    ]
}
```
- To fetch some history version we can use endpoint:
```
/audit-log/{originId}/snapshots?model={modelName}&version={versionId}
```
Example response:
```json
REQUEST: GET http://HOST/audit-log/13/snapshots?model=example&id=1
RESPONSE:
{
    "entity": {
        "id": 1,
        "name": "Example Data",
        "visible": true,
        "created_by": null,
    }
}
```
Under `entity` we can find our historic version.



## Contributing

Feel free to fork and make a Pull Request to this plugin project. All the input
is warmly welcome!

## Community support

For general help using Strapi, please refer to
[the official Strapi documentation](https://strapi.io/documentation/). For
additional help, you can use one of these channels to ask a question:

- [Email us](mailto:strapi@virtuslab.com) We are always glad to help.
- [Slack](http://slack.strapi.io) We're present on official Strapi slack
  workspace.
- [GitHub](https://github.com/VirtusLab/strapi-molecules/issues) (Bug reports,
  Contributions, Questions and Discussions)

## License

[MIT License](LICENSE.md) Copyright (c) 2020
[VirtusLab Sp. z o.o.](https://virtuslab.com/) &amp;
[Strapi Solutions](https://strapi.io/).
