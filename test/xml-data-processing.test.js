import { fixture, assert } from '@open-wc/testing';
// import { AmfLoader } from './amf-loader.js';
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
});
