import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('APIC-233', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'APIC-233';

  [
    ['json+ld data model', false],
    ['Compact data model', true]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let element;
      let amf;

      before(async () => {
        amf = await AmfLoader.load(compact, apiFile);
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('renders examples for arabic letters', () => {
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/stuff', 'get', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/json');
        assert.typeOf(result, 'array');
        const item = result[0];
        assert.equal(item.value, `{
  "الحالة": "حسنا",
  "message": "Shop in الممل"
}`);
      });
    });
  });
});
