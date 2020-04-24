[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-example-generator.svg)](https://www.npmjs.com/package/@api-components/api-example-generator)

[![Build Status](https://travis-ci.com/advanced-rest-client/api-example-generator.svg)](https://travis-ci.org/advanced-rest-client/api-example-generator)

## ExampleGenerator

Generates examples from the AMF model.

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Breaking

The `api-example-generator` custom element is deprecated and will be removed with the next major release.
The element was creates when the AmfHelperMixin needed a HTMLElement constructor. Now there is no such requirement and the not this works as a JS library.

## Usage

### Installation
```
npm install --save @api-components/api-example-generator
```

### API

See [src/ExampleGenerator](src/ExampleGenerator.js) for the public API.


```javascript
import { ExampleGenerator } '@api-components/api-example-generator';
const gen = new ExampleGenerator(amfModel);

const examples = new gen.computeExamples(schema, 'application/json', {...});
```


### In an html file

> This is deprecated

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

> This is deprecated

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
