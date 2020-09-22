# Strapi - Seeds Plugin (Bookshelf only)

Utilities for [Strapi Headless CMS](https://github.com/strapi/strapi) that allow
to seed database with initial data for content types

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended).
[Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-seeds
```

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can
be found in the documentation under
<a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation
Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.1.4 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested
nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new
projects**.

## Features

- Automatic seed initial data for strapi content types
- Support components

## Usage:

1.  Create `seeds` folder in strapi project root
2.  Create folder for each contentType (for example `/seeds/restaurant`)
3.  inside contentType dir create `.json` files which have to be synchronized in
    DB.

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
