[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-example-generator.svg)](https://www.npmjs.com/package/@api-components/api-example-generator)

[![Build Status](https://travis-ci.org/api-components/api-example-generator.svg?branch=stage)](https://travis-ci.org/api-components/api-example-generator)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/api-components/api-example-generator)

## &lt;api-example-generator&gt;

Examples generator from AMF model.

```html
<api-example-generator></api-example-generator>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-example-generator
```

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

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-example-generator/api-example-generator.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-example-generator></api-example-generator>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/api-components/api-example-generator
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
