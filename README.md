[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-example-generator.svg)](https://www.npmjs.com/package/@api-components/api-example-generator)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-example-generator.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-example-generator)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-example-generator)

## &lt;api-example-generator&gt;

API examples generator from the AMF model.

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Usage

### Installation
```
npm install --save @api-components/api-example-generator
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-example-generator/api-example-generator.js';
    </script>
  </head>
  <body>
    <api-example-generator></api-example-generator>
  </body>
</html>
```

### In a LitElement element

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-example-generator/api-example-generator.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <api-example-generator .amf="${this.model}"></api-example-generator>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Listing media types for payloads

Use `listMedia()` which accespts list of payloads or a single payload definition.

### Example for Payload(s)

Use `generatePayloadsExamples()` to genmerate a list of examples for payload(s).
Provide second argument which is a media type that should be used to generate an example.
Currently only `application/json` and `application/xml` is supported.
Feel free to send a PR to add support for more media types.

### Example from any AMF shape

The `computeExamples()` method tries to lookup an example property in any AMF shape.
If possible (and no `rawOnly` or `noAuto` option is set) then it generates an example
depending on passed object.

## Development

```sh
git clone https://github.com/advanced-rest-client/api-example-generator
cd api-example-generator
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
