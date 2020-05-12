import { html } from 'lit-element';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '../api-example-generator.js';
import './examples-render.js';

class ComponentDemo extends ApiDemoPage {
  constructor() {
    super();

    this.initObservableProperties([
      'noAuto',
      'rawOnly',
      'hasData',
      'examples',
      'demoStates',
      'darkThemeActive',
    ]);

    this.componentName = 'api-body-document';
    this.demoStates = ['Regular'];

    this._mediaTypeChanged = this._mediaTypeChanged.bind(this);
  }

  get generator() {
    return document.getElementById('generator');
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
    this.examples = this.generator.generatePayloadsExamples(
      this.payloads,
      media,
      opts
    );
  }

  setData(id) {
    const ml = document.getElementById('mediaList');
    if (ml) {
      ml.selected = undefined;
    }
    this.payloads = undefined;
    this.unionTypes = undefined;
    const webApi = this._computeWebApi(this.amf);
    const method = this._computeMethodModel(webApi, id);
    const expect = this._computeExpects(method);
    let payloads;
    if (expect) {
      payloads = this._computePayload(expect);
    }
    if (!payloads) {
      const returns = this._computeReturns(method);
      payloads = [];
      returns.forEach(item => {
        const data = this._computePayload(item);
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
      ['SE-14813', 'SE-14813'],
    ].map(
      ([file, label]) => html`
        <anypoint-item data-src="${file}-compact.json"
          >${label} - compact model</anypoint-item
        >
        <anypoint-item data-src="${file}.json">${label}</anypoint-item>
      `
    );
  }

  _dataDemoContainer() {
    const { darkThemeActive } = this;
    const examples = this.examples || [];
    return html` <anypoint-dropdown-menu>
        <label slot="label">Select media type</label>
        <anypoint-listbox
          slot="dropdown-content"
          id="mediaList"
          selected="0"
          @selected-changed="${this._mediaTypeChanged}"
        >
          ${this.mediaTypes
            ? this.mediaTypes.map(
                item =>
                  html`<anypoint-item data-type="${item}"
                    >${item}</anypoint-item
                  >`
              )
            : ''}
        </anypoint-listbox>
      </anypoint-dropdown-menu>

      <arc-interactive-demo ?dark="${darkThemeActive}">
        <div slot="content">
          ${examples.map(
            item => html`<examples-render .example="${item}"></examples-render>`
          )}
        </div>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noAuto"
          @change="${this._toggleMainOption}"
          title="Don't generate examples if missing in API definition"
        >
          No auto
        </anypoint-checkbox>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="rawOnly"
          @change="${this._toggleMainOption}"
          title="Return examples as they were defined in API spec file without automation."
        >
          Raw only
        </anypoint-checkbox>
      </arc-interactive-demo>`;
  }

  _demoTemplate() {
    const { hasData, amf } = this;
    return html` <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API example generator element with
        various configuration options.
      </p>
      <api-example-generator
        .amf="${amf}"
        id="generator"
      ></api-example-generator>

      ${hasData
        ? this._dataDemoContainer()
        : html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
    </section>`;
  }

  contentTemplate() {
    return html`
      <h2>API example generator</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
