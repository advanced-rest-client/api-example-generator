import { fixture, assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('XML processing', () => {
  async function basicFixture() {
    return (await fixture(`<api-example-generator></api-example-generator>`));
  }

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
          console.log(type);
          const shape = AmfLoader.lookupStructuredValue(amf, type);
          const result = element._xmlFromStructure(shape, {});
          assert.include(result, '<model>');
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
