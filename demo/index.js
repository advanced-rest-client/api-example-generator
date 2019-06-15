// import { html, render } from 'lit-html';
import { LitElement, html } from 'lit-element';
import { render } from 'lit-html';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@api-components/api-navigation/api-navigation.js';
import '../api-example-generator.js';
import './examples-render.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

export class DemoPage {
  constructor() {
    this._apiChanged = this._apiChanged.bind(this);
    this._navChanged = this._navChanged.bind(this);
    this._mediaTypeChanged = this._mediaTypeChanged.bind(this);
    this._noAutoChanged = this._noAutoChanged.bind(this);
    this._rawOnlyChanged = this._rawOnlyChanged.bind(this);

    window.addEventListener('api-navigation-selection-changed', this._navChanged);
    setTimeout(() => {
      document.getElementById('apiList').selected = 0;
    });
  }

  get generator() {
    return document.getElementById('generator');
  }

  get helper() {
    return document.getElementById('helper');
  }

  get amf() {
    return this._amf;
  }

  set amf(value) {
    this._setObservableProperty('amf', value);
  }

  get noAuto() {
    return this._noAuto;
  }

  set noAuto(value) {
    this._setObservableProperty('noAuto', value);
  }

  get rawOnly() {
    return this._rawOnly;
  }

  set rawOnly(value) {
    this._setObservableProperty('rawOnly', value);
  }

  get hasData() {
    return this._hasData;
  }

  set hasData(value) {
    this._setObservableProperty('hasData', value);
  }

  get examples() {
    return this._examples;
  }

  set examples(value) {
    this._setObservableProperty('examples', value);
  }

  _setObservableProperty(prop, value) {
    const key = '_' + prop;
    if (this[key] === value) {
      return;
    }
    this[key] = value;
    this.render();
  }

  _apiChanged(e) {
    const file = e.target.selectedItem.dataset.src;
    this._loadFile(file);
  }

  _loadFile(file) {
    fetch('./' + file)
    .then((response) => response.json())
    .then((data) => {
      this.amf = data;
    });
  }

  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    this.unionTypes = undefined;
    if (type === 'method') {
      this.setData(selected);
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  _mediaTypeChanged(e) {
    this.unionTypes = undefined;
    this.examples = undefined;
    const media = this.mediaTypes && this.mediaTypes[e.detail.value];
    if (!media) {
      return;
    }
    const opts = {};
    if (this.noAuto) {
      opts.noAuto = this.noAuto;
    }
    if (this.rawOnly) {
      opts.rawOnly = this.rawOnly;
    }
    this.examples = this.generator.generatePayloadsExamples(this.payloads, media, opts);
  }

  setData(id) {
    document.getElementById('mediaList').selected = undefined;
    this.payloads = undefined;
    this.unionTypes = undefined;
    const helper = this.helper;
    const webApi = helper._computeWebApi(this.amf);
    const method = helper._computeMethodModel(webApi, id);
    const expect = helper._computeExpects(method);
    let payloads;
    if (expect) {
      payloads = helper._computePayload(expect);
    }
    if (!payloads) {
      const returns = helper._computeReturns(method);
      payloads = [];
      returns.forEach((item) => {
        const data = helper._computePayload(item);
        if (data) {
          payloads = payloads.concat(data);
        }
      });
    }
    this.payloads = payloads;
    this.setupMediaTypes(payloads);
  }

  setupMediaTypes(payloads) {
    this.mediaTypes = this.generator.listMedia(payloads);
    const dropdown = document.getElementById('mediaDropdown');
    if (dropdown.hasAttribute('disabled')) {
      dropdown.removeAttribute('disabled');
    }
    document.getElementById('mediaList').selected = 0;
  }

  _rawOnlyChanged(e) {
    this.rawOnly = e.detail.value;
  }

  _noAutoChanged(e) {
    this.noAuto = e.detail.value;
  }

  apiListTemplate() {
    return html`
    <paper-item data-src="demo-api.json">Demo api</paper-item>
    <paper-item data-src="demo-api-compact.json">Demo api - compact model</paper-item>
    <paper-item data-src="amf-3-models/demo-api.json">Demo api (AMF 3)</paper-item>
    <paper-item data-src="se-8987.json">SE-8987</paper-item>
    <paper-item data-src="SE-10469.json">SE-10469</paper-item>
    <paper-item data-src="SE-10469-compact.json">SE-10469 - compact model</paper-item>
    <paper-item data-src="tracked-to-linked.json">Tracked elements</paper-item>
    <paper-item data-src="tracked-to-linked-compact.json">Tracked elements - compact model</paper-item>
    <paper-item data-src="APIC-188.json">APIC-188</paper-item>
    <paper-item data-src="APIC-188-compact.json">APIC-188 - compact model</paper-item>
    <paper-item data-src="APIC-187.json">APIC-187</paper-item>
    <paper-item data-src="APIC-187-compact.json">APIC-187 - compact model</paper-item>
    `;
  }

  headerTemplate() {
    return html`<raml-aware .api="${this.amf}" scope="api-demo"></raml-aware>
    <header>
      <paper-dropdown-menu label="Select demo API">
        <paper-listbox slot="dropdown-content" id="apiList" @selected-changed="${this._apiChanged}">
        ${this.apiListTemplate()}
        </paper-listbox>
      </paper-dropdown-menu>

      <paper-checkbox .checked="${this.noAuto}"
        @checked-changed="${this._noAutoChanged}"
        title="Don't generate examples if missing in API definition">No auto</paper-checkbox>
      <paper-checkbox .checked="${this.rawOnly}"
        @checked-changed="${this._rawOnlyChanged}"
        title="Return examples as they were defined in API spec file without translating them to selected mime type.">
        Raw only</paper-checkbox>
    </header>`;
  }

  render() {
    render(html`
    ${this.headerTemplate()}
    <div class="container" role="main">
      <api-navigation .amf="${this.amf}" endpoints-opened=""></api-navigation>

      <section class="demo">
        <paper-dropdown-menu label="Select media type" disabled="" id="mediaDropdown">
          <paper-listbox slot="dropdown-content" id="mediaList" @selected-changed="${this._mediaTypeChanged}">
          ${this.mediaTypes ?
            this.mediaTypes.map((item) => html`<paper-item data-type="${item}">${item}</paper-item>`) :
            undefined}
          </paper-listbox>
        </paper-dropdown-menu>

        <api-example-generator .amf="${this.amf}" id="generator"></api-example-generator>

        ${this.hasData && this.examples ?
          this.examples.map((item) => html`<examples-render .example="${item}"></examples-render>`) :
          html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
      </section>
    </div>

    <demo-element id="helper" .amf="${this.amf}"></demo-element>`, document.querySelector('#demo'));
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
