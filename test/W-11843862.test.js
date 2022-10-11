import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('W-11843862', () => {
  async function basicFixture(amf) {
    return fixture(html`<api-example-generator
      .amf="${amf}"
    ></api-example-generator>`);
  }

  const apiFile = 'W-11843862';

  [
    ['json+ld data model', false],
    ['Compact data model', true],
  ].forEach(([label, compact]) => {
    describe(/** @type {string} */ (label), () => {
      let element;
      let amf;

      before(async () => {
        amf = await AmfLoader.load(/** @type {boolean} */ (compact), apiFile);
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('Returns first enum option as example', () => {
        const headers = AmfLoader.lookupExpectsHeaderSchema(amf, '/cas/ad/contribution/external/v1/bill/list', 'get');
        const examples = element.computeExamples(headers[0], 'application/json', {});
        assert.lengthOf(examples, 1);
        assert.equal(examples[0].value, '1')
      });
    });
  });
});
