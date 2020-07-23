# strapi-plugin-content-search

## Description

Strapi search plugin provides /search endpoint that can be used to find content type fields which contain search string

###  Requirements

Complete installation requirements are exact same as for Strapi itself and can be found in the documentation under <a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.0.6 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new projects**.

###  Usage

To be able to find model content field, model needs **searchable** property with true value, then just use:
```
POST /content-search/search 
```
with:
```
"searchQuery": "string"
```

Example:

```
{
"searchQuery": "lorem"
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
