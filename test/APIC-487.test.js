import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('APIC-487', () => {
  async function basicFixture(amf) {
    return fixture(html`<api-example-generator
      .amf="${amf}"
    ></api-example-generator>`);
  }

  const apiFile = 'APIC-487';

  [
    ['json+ld data model', false],
    ['Compact data model', true],
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let element;
      let amf;

      beforeEach(async () => {
        amf = await AmfLoader.load(compact, apiFile);
        element = await basicFixture(amf);
      });

      it('Returns xml array example when not wrapped', () => {
        const type = AmfLoader.lookupReturnsPayload(amf, '/test1', 'get', 200);
        const result = element.generatePayloadsExamples(
          type,
          'application/xml'
        );
        assert.typeOf(result, 'array');
        assert.lengthOf(result, 1);

        const example = result[0];
        const expectedExample =
          '<?xml version="1.0" encoding="UTF-8"?>\n<Person>\n  <addresses>\n    <street></street>\n    <city></city>\n  </addresses>\n</Person>\n';
        assert.equal(expectedExample, example.value);
      });

      it('Returns xml array example when wrapped', () => {
        const type = AmfLoader.lookupReturnsPayload(amf, '/test2', 'post', 200);
        const result = element.generatePayloadsExamples(
          type,
          'application/xml'
        );
        assert.typeOf(result, 'array');
        assert.lengthOf(result, 1);

        const example = result[0];
        const expectedExample =
          '<?xml version="1.0" encoding="UTF-8"?>\n<WrappedPerson>\n  <addresses>\n    <Address>\n      <street></street>\n      <city></city>\n    </Address>\n  </addresses>\n</WrappedPerson>\n';
        assert.equal(expectedExample, example.value);
      });
    });
  });
});
