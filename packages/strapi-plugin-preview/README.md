# Strapi - Preview plugin

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
to preview content (pointing to custom URL) and allow to create clone of
original entry

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-preview
```

Then need to integrate /extensions folder with content-manager/admin to see
manual follow [This README](README-EXTENSIONS.md)

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.3.3 (recently tested)

(This plugin may work with the older Strapi versions, but these are not tested
nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features

-**Create Clone ** Now you will be able to clone every content type entry

-**Publish Clone ** When entry is clone, it could be published, which will
overwrite original contentType record

-**Preview your entry** With customised preview URI, You can preview your draft
(entry)

## Preview URL customization: Custom.js

in file `/config/custom.js` need to add previewUrl field with two parameters
like below:

```json
{
  "previewUrl": "http://localhost:8001/preview/:contentType/:id"
}
```

`:contentType` - will be replaced with contentType `:id` - will be replaced with
id of contentType record

## Component model configuration

Component by default is neither previewable and cloneable . To enable You can
configure it by setting `previewable` or `cloneable` to true in a configuration
json file (`*.settings.json`):

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
+    "previewable": true,
+    "cloneable": true
  },
  "attributes": {
    "body": {
      "type": "text"
    }
  }
}
```

Previewing and Cloning could be mixed, or you can just set one of them.

## Usage

- Clone - Go to entry and click Clone (it will add new entry and set relation to
  original entry "cloneOf")
- Preview - Go to entry and click Preview (it will redirect to URI provided in
  custom.js configuration with injected contentType and id)
- Publish - if entry has `cloneOf` relation, than You will be able to replace
  original entry with your modified one by clicking "publish" and confirmation
  in modal

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
