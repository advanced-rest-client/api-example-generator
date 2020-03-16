import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('SE-13092', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'SE-13092';

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

      it('generates name from data type fragment included into types map', () => {
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/customer', 'post', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/xml');
        assert.typeOf(result, 'array');
        const item = result[0];
        const { value } = item;
        assert.include(value, '<Person>', 'generates type name (opening tag)');
        assert.include(value, '</Person>', 'generates type name (closing tag)');
      });

      // This should be incorrect but the AMF model includes name anyway.
      // Detailed discussion about this: https://www.mulesoft.org/jira/browse/SE-13092
      it('generates name from inline include for data type fragment included into types map', () => {
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/should-be-incorrect', 'post', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/xml');
        assert.typeOf(result, 'array');
        const item = result[0];
        const { value } = item;
        assert.include(value, '<type>', 'generates type name (opening tag)');
        assert.include(value, '</type>', 'generates type name (closing tag)');
      });

      it('uses default name for data type not fragment included into types map', () => {
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/incorrect-way', 'post', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/xml');
        assert.typeOf(result, 'array');
        const item = result[0];
        const { value } = item;
        assert.include(value, '<type>', 'uses type name (opening tag)');
        assert.include(value, '</type>', 'uses type name (closing tag)');
      });
    });
  });
});
