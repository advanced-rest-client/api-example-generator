import { LitElement, html, css } from 'lit-element';
/**
 * @customElement
 * @polymer
 */
class ExamplesRender extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      .output {
        padding: 8px;
        background-color: #fff3e0;
      }

      .output-raw {
        padding: 8px;
        background-color: #f1f8e9;
      }

      .raw-toggle {
        text-decoration: underline;
        color: blue;
        cursor: pointer;
      }
    `;
  }

  static get properties() {
    return {
      example: { type: Object },

      isUnion: { type: Boolean },

      rawOpened: { type: Boolean },

      unions: { type: Array },

      selectedUnion: { type: Number },

      unionExample: { type: Object },
    };
  }

  get example() {
    return this._example;
  }

  set example(value) {
    const oldValue = this._example;
    if (value === oldValue) {
      return;
    }
    this._example = value;
    this.requestUpdate('example', oldValue);
    this.isUnion = !!(value && value.hasUnion);
    this.unions = this.isUnion ? this._computeUnions(value) : undefined;
    this.unionExample = this._computeUnionExamples(this._selectedUnion, value);
  }

  get selectedUnion() {
    return this._selectedUnion;
  }

  set selectedUnion(value) {
    const oldValue = this._selectedUnion;
    if (value === oldValue) {
      return;
    }
    this._selectedUnion = value;
    this.requestUpdate('selectedUnion', oldValue);
    this.unionExample = this._computeUnionExamples(value, this._example);
  }

  toggleRaw() {
    this.rawOpened = !this.rawOpened;
  }

  _computeUnions(example) {
    if (!example.values) {
      return undefined;
    }
    return example.values.map(item => item.title);
  }

  _computeUnionExamples(selectedUnion, example) {
    if (selectedUnion === undefined || selectedUnion < 0) {
      return undefined;
    }
    if (!example || !example.values) {
      return undefined;
    }
    return example.values[selectedUnion];
  }

  _unionChangeHandler(e) {
    this.selectedUnion = e.detail.value;
  }

  _unionTemplate() {
    const { unions } = this;
    if (!unions) {
      return html`<p>Unions not set</p>`;
    }
    return html`
      <paper-dropdown-menu label="Select union type">
        <paper-listbox
          slot="dropdown-content"
          .selected="${this.selectedUnion}"
          @selected-changed="${this._unionChangeHandler}"
        >
          ${unions.map(
            item => html`<paper-item data-type="${item}">${item}</paper-item>`
          )}
        </paper-listbox>
      </paper-dropdown-menu>
      ${this.unionExample
        ? html`<examples-render
            .example="${this.unionExample}"
          ></examples-render>`
        : undefined}
    `;
  }

  _exampleTemplate() {
    const { example } = this;
    if (!example) {
      return html`<p>Example not set</p>`;
    }
    return html`
      ${example.hasTitle ? html`<h3>${example.title}</h3>` : undefined}
      <pre class="output">${example.value}</pre>
      ${example.hasRaw
        ? html` <p>
              Example has raw value.
              <span class="raw-toggle" role="button" @click="${this.toggleRaw}"
                >Toggle raw.</span
              >
            </p>
            ${this.rawOpened
              ? html`<pre class="output-raw">${example.raw}</pre>`
              : undefined}`
        : undefined}
    `;
  }

  render() {
    return this.isUnion ? this._unionTemplate() : this._exampleTemplate();
  }
}
window.customElements.define('examples-render', ExamplesRender);
