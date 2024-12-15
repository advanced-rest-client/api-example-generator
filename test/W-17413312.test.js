import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('W-17413312', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'W-17413312';

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
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/sources', 'get', 200);
        const result = element.generatePayloadsExamples(payloads, 'application/json');
        assert.typeOf(result, 'array');
        const item = result[0];
        assert.equal(item.value, `{
  "data": [
    {
      "id": "64f1f0d46ad16b6acdaa3e0e",
      "name": "Main Station Track 5a",
      "type": "Camera",
      "class": "Common",
      "audio": {
        "isEnabled": true
      },
      "externalReference": "b8755c8d-ef9d-4a7e-a8a2-7b5abace1af7",
      "streams": [
        {
          "id": "64f1eff26ad16b6acdaa3e08",
          "url": "rtsp://ipcam573.example.com:554/live/ch0",
          "decoderOptions": {
            "protocols": 2,
            "tcp-timeout": 10000000
          }
        }
      ],
      "authentication": {}
    }
  ],
  "meta": {}
}`);
      });
    });
  });
});
