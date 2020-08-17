# Strapi - Content search service (bookshelf only)

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
searching across content types fields which have searchable property.

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-content-search
```

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.1.1 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested
nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features

-**Search by content type entity field** Now you will be able to search through
all content-type fields!

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

## Usage

To be able to find model content field, model needs **searchable** property with
true value, then just use:

```
POST /content-search/search
```

with:

```
"_q": "string"
```

Example:

```
{
"_q": "lorem"
}
```

Response:

```
[
    [
        {
            "id": 1,
            "title": "lorem",
            "content": "lorem ipsum",
            "created_at": "2020-07-23T09:48:24.140Z",
            "updated_at": "2020-07-23T09:48:24.140Z",
            "__contentType": "exmaple_content_type"
        }
    ]
]
```

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
