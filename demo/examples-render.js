import {PolymerElement} from '../../../@polymer/polymer/polymer-element.js';
import {html} from '../../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * @customElement
 * @polymer
 */
class ExamplesRender extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
    };

    .output {
      padding: 8px;
      background-color: #FFF3E0;
    }

    .output-raw {
      padding: 8px;
      background-color: #F1F8E9;
    }

    .raw-toggle {
      text-decoration: underline;
      color: blue;
      cursor: pointer;
    }
    </style>
    <template is="dom-if" if="[[isUnion]]" restamp="">
      <paper-dropdown-menu label="Select union type">
        <paper-listbox slot="dropdown-content" selected="{{selectedUnion}}">
          <template is="dom-repeat" items="[[unions]]">
            <paper-item data-type\$="[[item]]">[[item]]</paper-item>
          </template>
        </paper-listbox>
      </paper-dropdown-menu>

      <template is="dom-if" if="[[unionExample]]">
        <examples-render example="[[unionExample]]"></examples-render>
      </template>
    </template>
    <template is="dom-if" if="[[!isUnion]]">
      <template is="dom-if" if="[[example.hasTitle]]">
        <h3>[[example.title]]</h3>
      </template>
      <pre class="output">[[example.value]]</pre>
      <template is="dom-if" if="[[example.hasRaw]]">
        <p>Example has raw value. <span class="raw-toggle" role="button" on-click="toggleRaw">Toggle raw.</span></p>
        <template is="dom-if" if="[[rawOpened]]" restamp="">
          <pre class="output-raw">[[example.raw]]</pre>
        </template>
      </template>
    </template>
`;
  }

  static get is() {
    return 'examples-render';
  }
  static get properties() {
    return {
      example: Object,
      isUnion: {
        type: Boolean,
        computed: '_computeIsUnion(example)'
      },
      rawOpened: Boolean,
      unions: {
        type: Array,
        computed: '_computeUnions(isUnion, example)'
      },

      selectedUnion: Number,

      unionExample: {
        type: Object,
        computed: '_computeUnionExamples(selectedUnion, example)'
      }
    };
  }

  _computeIsUnion(example) {
    return !!(example && example.hasUnion);
  }

  toggleRaw() {
    this.rawOpened = !this.rawOpened;
  }

  _computeUnions(isUnion, example) {
    if (!isUnion || !example || !example.values) {
      return;
    }
    return example.values.map((item) => item.title);
  }

  _computeUnionExamples(selectedUnion, example) {
    if (selectedUnion === undefined || selectedUnion < 0) {
      return;
    }
    if (!example || !example.values) {
      return;
    }
    return example.values[selectedUnion];
  }
}
window.customElements.define(ExamplesRender.is, ExamplesRender);
