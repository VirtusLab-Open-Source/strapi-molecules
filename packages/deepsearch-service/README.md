# Deep search (bookshelf only)

## Description

Strapi molecule which includes a set of utility functions that allow searching across nested structures.

##  Requirements

Complete installation requirements are exact same as for Strapi itself and can be found in the documentation under <a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.0.6 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new projects**.

##  Installation

npm:
```
npm install @strapi-molecules/deepsearch-service
```

yarn:
```
yarn add @strapi-molecules/deepsearch-service
```

**Supported Strapi versions**:

- Strapi v3.0.6 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new projects**.

## Component configuration

Component by default is not searchable, if You want component to be included in search or be able to filter by, you need to set option searchable to true in configuration json file:

for example for component called `paragraph` You need to change `components/text/paragraph.json` by modifying options object:
```
{
  "collectionName": "components_text_paragraphs",
  "info": {
    "name": "Paragraph",
    "icon": "align-justify"
  },
  "options": {
    "searchable": true
  },
  "attributes": {
    "body": {
      "type": "text"
    }
  }
}
```  
## Controllers configuration

#### deep search for single model example [resturant controller](examples/restaurant.js)

#### generic deep search [deep search controller](examples/global-endpoint.js)

## Requests
find:
 `/restaurant?paragraph.body_contains=bar`
count:
 `/restaurant/count?paragraph.body_contains=bar`
search:
 `/restaurant?_q=foo`
countSearch:
 `/restaurant/count?_q=foo`

#### Combining filters

 between _q and rest of filters result in AND operator

 `/restaurant?_q=foo&paragraph.body_contains=bar` is equal to `_q=foo AND paragraph.body_contains=bar`

 between named parameters (title_contains, paragraph.body_contains etc.) results in OR operator:

 `/restaurant?paragraph.body_contains=foo&paragraph.body_contains=bar` is equal to `paragraph.body_contains=foo OR paragraph.body_contains=bar`

## API
#### find
```
    const entities = await find(model, ctx.query);
```
#### count
```
    const count = await count(model, ctx.query);
```
#### search
```
    const entities = await search(model, ctx.query);
```
#### searchCount
```
    const count = await countSearch(model, ctx.query);
```
