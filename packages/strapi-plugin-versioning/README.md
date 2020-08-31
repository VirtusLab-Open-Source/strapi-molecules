# Strapi - Versioning Plugin (bookshelf only)

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
to store entity versions.

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-versioning
```

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.1.4 (recently tested)

(Because this plugin is based on an extension, there is no guarantee that it
will work properly on any other Strapi version. Not working with v3.13 (there is
no select on entity edit page))

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features

- **Admin entity changes versioning** Now you can are able to check and revert
  all changes you have made on strapi admin.
- **Api entity changes versioning:** Also changes made with external api will be
  visible and reversible

## Setup

For Strapi stable versions, add a middleware.js file within your config folder

```diff
touch config/middleware.js
```

Enable the versions middleware by adding the following snippet to an empty
middleware file or simply add in the settings from the below example:

```diff
module.exports = ({ env }) => ({
  settings: {
   "versions-middleware": {
      enabled: true,
    },
  },
});
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
