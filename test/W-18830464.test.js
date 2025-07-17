import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('W-18830464', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'W-18830464';

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
        const payloads = AmfLoader.lookupPayload(
          amf,
          '/preferences',
          'post'
        );
        const result = element.generatePayloadsExamples(
          payloads,
          'application/json'
        );
        const item = result[0];
        assert.equal(item.value, `[
  {
    "programID": "ENERGYALERT",
    "channelID": "EMAIL",
    "userID": "CCB_IDL_Provider",
    "customProperties": 0
  },
  {
    "link": 0
  },
  {
    "programID": "ENERGYALERT",
    "channelID": "EMAIL",
    "userID": "CCB_IDL_Provider",
    "customProperties": 0
  },
  {
    "link": 0
  }
]`);
      });
    });
  });
});
