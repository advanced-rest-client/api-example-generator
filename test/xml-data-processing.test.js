import { fixture, assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('XML processing', () => {
  async function basicFixture() {
    return (await fixture(`<api-example-generator></api-example-generator>`));
  }

  describe('General processing', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact);
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
        });

        it('basic formatting and type name', () => {
          const payload = AmfLoader.lookupPayload(amf, '/IncludedInType', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<Person>', 'Type name is set');
          assert.include(value, ' <error>false</error>', 'XML is formatted');
          assert.include(value, ' <image>\n', 'Complex type is formatted is formatted');
          assert.include(value, ' </image>\n', 'Complex type is formatted at the end');
        });

        it('adds attribute to parent type', () => {
          const payload = AmfLoader.lookupPayload(amf, '/IncludedInline', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<Person error="false">', 'Type has attributes');
        });

        it('uses example from RAML example', () => {
          const payload = AmfLoader.lookupPayload(amf, '/typeExamples', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<firstName>Pawel</firstName>', 'has example value');
          assert.include(value, '  <firstName>', 'example is formatted');
        });

        it('uses example from property example', () => {
          const payload = AmfLoader.lookupPayload(amf, '/propertyExamples', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<zip>94100</zip>', 'has example value');
          assert.include(value, '<street></street>', 'has default empty value');
          assert.include(value, '    <street></street>', 'example value is formatted');
        });

        it('renders array types', () => {
          const payload = AmfLoader.lookupPayload(amf, '/ArrayType', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<ArrayType>\n', 'has parent type name');
          assert.include(value, '  <Image>', 'has item type name');
        });

        it('generates examples for array type (inline included)', () => {
          const payload = AmfLoader.lookupPayload(amf, '/arrayPropertyGeneratedExamples', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<schema>\n', 'has parent type name');
          assert.include(value, '  <items>', 'has item type name');
          assert.include(value, '    <test></test>', 'has property name');
        });

        it('generates examples for wrapped annotation', () => {
          const payload = AmfLoader.lookupPayload(amf, '/wrappedXml', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<Imgs>\n', 'has parent type name');
          assert.include(value, '  <something></something>', 'has parent properties');
          assert.include(value, '  <images>', 'has wrapped outer element');
          assert.include(value, '    <Image>', 'has wrapped object');
        });

        it('generates (invalid) example for inline type', () => {
          const payload = AmfLoader.lookupPayload(amf, '/inline-property-example', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<schema>\n', 'has defualt name');
          assert.include(value, '  <amf_inline_type_6>', 'has invalid properties');
        });

        it('renders default name forn inline included types', () => {
          const payload = AmfLoader.lookupPayload(amf, '/user-raml-example', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<unknown-type>\n', 'has defualt name');
          assert.include(value, '  <id>uid1</id>', 'has properties');
        });

        it('renders RAML named example', () => {
          const payload = AmfLoader.lookupPayload(amf, '/named-example', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<schema>\n', 'has AMF defualt name');
          assert.include(value, '  <countryCode>BE</countryCode>', 'has properties');
        });

        it('renders RAML linked named example', () => {
          const payload = AmfLoader.lookupPayload(amf, '/named-linked-example', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<schema>\n', 'has AMF defualt name');
          assert.include(value, '  <company>\n', 'has properties');
          assert.include(value, '      <countryCode>BE</countryCode>\n', 'has deep properties');
        });

        it('renders typed valued', () => {
          const payload = AmfLoader.lookupPayload(amf, '/data-types', 'post');
          const result = element.generatePayloadsExamples(payload, 'application/xml');
          const { value } = result[0];
          assert.include(value, '<typeString>String example</typeString>', 'has string value');
          assert.include(value, '<typeNumber>123456</typeNumber>', 'has number value');
          assert.include(value, '<typeInt>1234546</typeInt>', 'has int value');
          assert.include(value, '<typeDecimal>10.67</typeDecimal>', 'has decimal value');
          assert.include(value, '<typeBool>true</typeBool>', 'has boolean value');
          assert.include(value, '<typeNull></typeNull>', 'has null value');
          assert.include(value, '<typeNegativeInt>-12</typeNegativeInt>', 'has negative int value');
          assert.include(value, '<typeNumberFormatInt64>8</typeNumberFormatInt64>', 'has Int64 value');
          assert.include(value, '<typeNumFormatInt32>109298</typeNumFormatInt32>', 'has Num32 value');
          assert.include(value, '<typeNumFormatInt16>2</typeNumFormatInt16>', 'has Num16 value');
          assert.include(value, '<typeNumFormatInt8>1</typeNumFormatInt8>', 'has Num8 value');
          assert.include(value, '<typeIntFormatInt8>12</typeIntFormatInt8>', 'has Int8 value');
          assert.include(value, '<typeNumFormatInt>11</typeNumFormatInt>', 'has Num value');
          assert.include(value, '<typeNumFormatLong>123456789</typeNumFormatLong>', 'has long value');
          assert.include(value, '<typeNumFormatFloat>1234567.89</typeNumFormatFloat>', 'has float value');
          assert.include(value, '<typeNumFormatDouble>1234.56789</typeNumFormatDouble>', 'has double value');
        });
      });
    })
  });

  describe('_xmlProcessDataProperty()', () => {
    describe('name processing', () => {
      let element;
      let doc;
      let node;
      let shape;
      beforeEach(async () => {
        element = await basicFixture();
        doc = document.implementation.createDocument('', 'test', null);
        node = doc.documentElement;
        shape = {
          '@value': 'test'
        };
      });

      function toString(doc) {
        const s = new XMLSerializer();
        return s.serializeToString(doc);
      }

      it('creates node with value', () => {
        element._xmlProcessDataProperty(doc, node, shape, 'test');
        const value = toString(doc);
        assert.equal(value, '<test>test</test>');
      });

      //
      // The "test" value comes from the shape's definition.
      // This tests for an error when creating new element
      //

      it('normalizes name with "?"', () => {
        element._xmlProcessDataProperty(doc, node, shape, 'test?');
        assert.equal(toString(doc), '<test>test</test>');
      });

      it('normalizes name with whitespace', () => {
        element._xmlProcessDataProperty(doc, node, shape, 'some value');
        assert.equal(toString(doc), '<test>test</test>');
      });

      it('normalizes name with special characters', () => {
        element._xmlProcessDataProperty(doc, node, shape, 'special.*');
        assert.equal(toString(doc), '<test>test</test>');
      });
    });
  });

  describe('_xmlFromStructure()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact);
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
        });

        it('creates example value from structuredValue', () => {
          const type = AmfLoader.lookupType(amf, 'Person');
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {});
          assert.typeOf(result, 'string');
        });

        it('result has XML header', () => {
          const type = AmfLoader.lookupType(amf, 'Person');
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {});
          assert.include(result, '<?xml version="1.0" encoding="UTF-8"?>');
        });

        it('result has default type name', () => {
          const type = AmfLoader.lookupType(amf, 'Person');
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {});
          assert.include(result, '<unknown-type>');
        });

        it('result has type name passed in options', () => {
          const type = AmfLoader.lookupType(amf, 'Person');
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {
            typeName: 'TypeName'
          });
          assert.include(result, '<TypeName>');
        });

        it('type name is normalized', () => {
          const type = AmfLoader.lookupType(amf, 'Person');
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {
            typeName: 'T e*s?t'
          });
          assert.include(result, '<Test>');
        });
      });
    });
  });

  describe('_xmlExampleFromProperties()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        const typeName = 'TestType';

        before(async () => {
          amf = await AmfLoader.load(compact);
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
        });

        it('creates example value from structuredValue', () => {
          const props = AmfLoader.lookupTypeProperties(amf, 'Address');
          const result = element._xmlExampleFromProperties(props, typeName);
          assert.typeOf(result, 'string');
        });

        it('normalizes type name', () => {
          const props = AmfLoader.lookupTypeProperties(amf, 'Address');
          const result = element._xmlExampleFromProperties(props, 'T e*s?t');
          assert.include(result, '<Test>');
        });

        it('has all properties', () => {
          const props = AmfLoader.lookupTypeProperties(amf, 'Address');
          const result = element._xmlExampleFromProperties(props, typeName);
          assert.include(result, '<street>', 'has street');
          assert.include(result, '<zip>', 'has zip');
          assert.include(result, '<house>', 'has house');
        });

        it('has example values', () => {
          const props = AmfLoader.lookupTypeProperties(amf, 'Address');
          const result = element._xmlExampleFromProperties(props, typeName);
          assert.include(result, '<zip>94100</zip>', 'has zip');
          assert.include(result, '<house>1</house>', 'has house');
        });

        it('uses space as a default empty example value', () => {
          const props = AmfLoader.lookupTypeProperties(amf, 'Address');
          const result = element._xmlExampleFromProperties(props, typeName);
          assert.include(result, '<street> </street>');
        });
      });
    });
  });
});
