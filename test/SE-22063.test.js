import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('SE-22063', () => {
  async function basicFixture(amf) {
    return fixture(html`<api-example-generator
      .amf="${amf}"
    ></api-example-generator>`);
  }

  const apiFile = 'SE-22063';

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

      it('generates xml example using xml name and xml wrap', () => {
        const payload = AmfLoader.lookupPayload(amf, '/demo', 'post');
        const result = element.generatePayloadsExamples(
          payload,
          'application/xml'
        );
        assert.typeOf(result, 'array');
        const item = result[0];
        const { value } = item;
        assert.equal(
          value,
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<StockBalance>\n' +
            '  <type>site</type>\n' +
            '  <item>\n' +
            '    <item>\n' +
            '      <ssccNumber>P19227</ssccNumber>\n' +
            '      <materialReference>CL54B</materialReference>\n' +
            '      <variantId>R0029</variantId>\n' +
            '      <batch>BA02931</batch>\n' +
            '      <quantity>1</quantity>\n' +
            '    </item>\n' +
            '  </item>\n' +
            '</StockBalance>\n'
        );
      });
    });
  });
});
