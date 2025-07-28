import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('W-17309546', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'W-17309546';

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

      it('renders examples right', () => {
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/test', 'get', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/json');
        assert.typeOf(result, 'array');
        const item = result[0];
        assert.equal(item.value, `[
  {
    "id": 1,
    "name": "Alice Dupont",
    "email": "alice.dupont@example.com",
    "companyDateEntry": "2003-05-14T00:00:00.000Z",
    "postal_code": "075001"
  },
  {
    "id": 2,
    "name": "Bob Martin",
    "email": "bob.martin@example.com",
    "companyDateEntry": "2004-05-04T00:00:00.000Z",
    "postal_code": "169002"
  },
  {
    "id": 3,
    "name": "Charlie Durand",
    "email": "charlie.durand@example.com",
    "companyDateEntry": "2003-08-11T00:00:00.000Z",
    "postal_code": "013003"
  }
]`);
      });
    });
  });
});
