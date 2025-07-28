import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('W-19097505', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'W-19097505';

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
        const payloads = AmfLoader.lookupReturnsPayload(amf, '/1.0/vehicle/manual', 'get', 200);
        const result = element.generatePayloadsExamples(
          payloads,
          'application/json'
        );
        const item = result[0];
        assert.equal(item.value, `[
  {
    "locale": "en-NZ",
    "make": "TOYOTA",
    "model": "AXAL64R_7",
    "modelYear": "2026",
    "vehicleRegion": "NZ",
    "createdAt": "2025-06-25T03:31:08.000Z",
    "documents": {
      "om": [
        {
          "documentType": "om",
          "documentUrl": "https://toyotanz.bynder.com/m/1a9818c1db004a8/original/AXAHA_NM1_OM_GeneralOceania_OM00C00E_1_2507-pdf.pdf",
          "pubNumber": "OM00C00E",
          "summary": "AXAHA_NM1_OM_GeneralOceania_OM00C00E_1_2507.pdf",
          "title": "AXAHA_NM1_OM_GeneralOceania_OM00C00E_1_2507-pdf.pdf"
        }
      ],
      "omms": [],
      "omnav": [
        {
          "documentType": "omnav",
          "documentUrl": "https://toyotanz.bynder.com/m/81e86f1e4959e02/original/AXAHA_NM1_MM_GeneralOceania_OM00C00E_1_2507.pdf",
          "pubNumber": "OM00C00E",
          "summary": "AXAHA_NM1_MM_GeneralOceania_OM00C00E_1_2507",
          "title": "AXAHA_NM1_MM_GeneralOceania_OM00C00E_1_2507.pdf"
        }
      ]
    }
  }
]`);
      });
    });
  });
});
