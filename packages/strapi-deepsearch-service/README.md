# Strapi - Deep search service (bookshelf only)

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
searching across nested structures including components.

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-deepsearch-service
```

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.3.3 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested
nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features

- **Nested structure support** Now you can search by a component or even their
  children (components, related content types)
- **Query by the components:** When component is searchable \_q parameter will
  apply also to all component attributes
- **Using builtin filters wit components** now such suffixes like \_contains,
  \_eq etc could be used together with components attributes

## Component model configuration

Component by default is not searchable. To enable Component to be included in
search or be able to filter by, you've to add option searchable to true in a
configuration json file (`*.settings.json`):

For example for component called `paragraph_component` You need to change
`components/text/paragraph_component.json` by modifying option object:

```diff
{
  "collectionName": "components_text_paragraph_components",
  "info": {
    "name": "paragraph_component",
    "icon": "align-justify"
  },
  "options": {
    +"searchable": true
  },
  "attributes": {
    "body": {
      "type": "text"
    }
  }
}
```

## Public API

### find

```
    const entities = await find(model, ctx.query);
```

request examples: `/restaurant?paragraph_component.body_contains=foo`
`/restaurant?paragraph_component.body_contains=foo&paragraph_component.body_contains=bar`

### count

```
    const count = await count(model, ctx.query);
```

request examples: `/restaurant/count?paragraph_component.body_contains=bar`

### search

```
    const entities = await search(model, ctx.query);
```

request examples (will search by all searchable components):
`/restaurant?_q=foo` `/restaurant?_q=foo&paragraph_component.title_contains=foo`

### searchCount

```
    const count = await countSearch(model, ctx.query);
```

request examples (will search by all searchable components):
`/restaurant?_q=foo` `/restaurant?_q=foo&paragraph_component.title_contains=foo`

## Examples

#### deep search for single model example [resturant controller](examples/restaurant.js)

#### generic deep search [deep search controller](examples/global-endpoint.js)

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
