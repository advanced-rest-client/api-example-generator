// import { html, render } from 'lit-html';
import { LitElement, html } from 'lit-element';
import { render } from 'lit-html';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@api-components/api-navigation/api-navigation.js';
import '../api-example-generator.js';
import './examples-render.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class DemoPage extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'api-body-document';
    this.demoStates = ['Normal state'];

    this.initObservableProperties([
      'noAuto',
      'rawOnly',
      'hasData',
      'examples',
      'demoStates',
      'darkThemeActive',
    ]);

    this._mediaTypeChanged = this._mediaTypeChanged.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
  }

  get generator() {
    return document.getElementById('generator');
  }

  get helper() {
    return document.getElementById('helper');
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
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
    const ml = document.getElementById('mediaList');
    if (ml) {
      ml.selected = undefined;
    }
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
    const ml = document.getElementById('mediaList');
    if (ml) {
      ml.selected = 0;
    }
  }

  _rawOnlyChanged(e) {
    this.rawOnly = e.detail.value;
  }

  _noAutoChanged(e) {
    this.noAuto = e.detail.value;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
      ['tracked-to-linked', 'Tracked elements'],
      ['se-8987', 'SE-8987'],
      ['SE-10469', 'SE-10469'],
      ['SE-13092', 'SE-13092'],
      ['APIC-188', 'APIC-188'],
      ['APIC-187', 'APIC-187'],
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
  }

  _dataDemoContainer() {
    const {
      darkThemeActive
    } = this;
    const examples = this.examples || [];
    return html`<paper-dropdown-menu label="Select media type">
      <paper-listbox slot="dropdown-content" id="mediaList" selected="0" @selected-changed="${this._mediaTypeChanged}">
      ${this.mediaTypes ?
        this.mediaTypes.map((item) => html`<paper-item data-type="${item}">${item}</paper-item>`) :
        undefined}
      </paper-listbox>
    </paper-dropdown-menu>

    <arc-interactive-demo
      ?dark="${darkThemeActive}"
    >
      <div slot="content">
        ${examples.map((item) => html`<examples-render .example="${item}"></examples-render>`)}
      </div>
      <label slot="options" id="mainOptionsLabel">Options</label>
      <paper-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="noAuto"
        @change="${this._toggleMainOption}"
        title="Don't generate examples if missing in API definition"
      >
        No auto
      </paper-checkbox>
      <paper-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="rawOnly"
        @change="${this._toggleMainOption}"
        title="Return examples as they were defined in API spec file without automation."
      >
        Raw only
      </paper-checkbox>
    </arc-interactive-demo>`;
  }

  _demoTemplate() {
    const {
      hasData,
      amf
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API example generator element with various
        configuration options.
      </p>
      <api-example-generator .amf="${amf}" id="generator"></api-example-generator>
      <section class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">
          ${hasData ? this._dataDemoContainer() : html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
        </div>
      </section>
    </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}
      <demo-element id="helper" .amf="${amf}"></demo-element>

      <div role="main">
        <h2 class="centered main">API example generator</h2>
        ${this._demoTemplate()}
      </div>
      `, document.querySelector('#demo'));
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
