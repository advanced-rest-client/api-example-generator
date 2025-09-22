import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-example-generator.js';

describe('Additional Properties Fix', () => {
  async function basicFixture(amf) {
    return (await fixture(html`<api-example-generator
      .amf="${amf}"></api-example-generator>`));
  }

  const apiFile = 'v4_0_0_api_specs';

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

      it('should handle additionalProperties without crashing', () => {
        // This test reproduces the bug where additionalProperties caused 
        // a crash due to properties being null/undefined
        
        // Look for a payload that uses ForceConfig schema which has additionalProperties: true
        const payloads = AmfLoader.lookupPayload(
          amf,
          '/v4.0.0/messages',
          'post'
        );
        
        // This should not throw an error and should generate a valid example
        const result = element.generatePayloadsExamples(
          payloads,
          'application/json'
        );
        
        assert.typeOf(result, 'array', 'Should return an array of examples');
        assert.isAbove(result.length, 0, 'Should have at least one example');
        
        const example = result[0];
        assert.typeOf(example.value, 'string', 'Example should have a string value');
        assert.isFalse(example.hasRaw, 'Should not be a raw example');
        assert.isFalse(example.hasTitle, 'Should not have a title');
        assert.isFalse(example.hasUnion, 'Should not be a union');
        
        // Verify it's valid JSON
        assert.doesNotThrow(() => {
          JSON.parse(example.value);
        }, 'Generated example should be valid JSON');
      });

      it('should generate examples for schemas with additionalProperties: true', () => {
        // Test specifically for schemas that have additionalProperties: true
        // This tests the fix in _computeJsonObjectValue method
        
        const payloads = AmfLoader.lookupPayload(
          amf,
          '/v4.0.0/messages',
          'post'
        );
        
        const result = element.generatePayloadsExamples(
          payloads,
          'application/json'
        );
        
        assert.typeOf(result, 'array');
        const example = result[0];
        
        // The example should be generated successfully without "Unknown type"
        assert.typeOf(example.value, 'string');
        assert.notInclude(example.value.toLowerCase(), 'unknown', 'Should not contain "unknown" type');
        
        // Parse the JSON to verify structure
        const parsedExample = JSON.parse(example.value);
        assert.typeOf(parsedExample, 'object', 'Should generate a valid JSON object');
      });

      it('should handle _jsonExampleFromProperties with null properties gracefully', () => {
        // This test verifies the specific fix: adding null check in _jsonExampleFromProperties
        
        // Test the method directly with null properties
        const result = element._jsonExampleFromProperties(null);
        assert.typeOf(result, 'object', 'Should return an empty object when properties is null');
        assert.deepEqual(result, {}, 'Should return empty object for null properties');
        
        // Test with undefined properties
        const result2 = element._jsonExampleFromProperties(undefined);
        assert.typeOf(result2, 'object', 'Should return an empty object when properties is undefined');
        assert.deepEqual(result2, {}, 'Should return empty object for undefined properties');
        
        // Test with empty array (should work as before)
        const result3 = element._jsonExampleFromProperties([]);
        assert.typeOf(result3, 'object', 'Should return an empty object for empty array');
        assert.deepEqual(result3, {}, 'Should return empty object for empty properties array');
      });

      it('should handle _computeJsonObjectValue with additionalProperties correctly', () => {
        // Test the _computeJsonObjectValue method directly to ensure it handles 
        // additionalProperties scenarios without crashing
        
        // Create a mock range object similar to what would be generated for additionalProperties
        const mockRange = {
          [element._getAmfKey(element.ns.w3.shacl.property)]: null, // No regular properties
          [element._getAmfKey(element.ns.w3.shacl.additionalPropertiesSchema)]: [
            {
              [element._getAmfKey(element.ns.w3.shacl.property)]: null // additionalProperties with null properties
            }
          ]
        };
        
        // This should not crash and should return an empty object
        const result = element._computeJsonObjectValue(mockRange);
        assert.typeOf(result, 'object', 'Should return an object');
        assert.deepEqual(result, {}, 'Should return empty object when no properties can be processed');
      });

      it('regression test: should work with version 4.4.27 behavior and beyond', () => {
        // This is a regression test to ensure the fix maintains compatibility
        // with the behavior that worked in version 4.4.27
        
        const payloads = AmfLoader.lookupPayload(
          amf,
          '/v4.0.0/messages',
          'post'
        );
        
        // Before the fix (4.4.28+), this would throw an error or return "Unknown type"
        // After the fix, it should work correctly
        assert.doesNotThrow(() => {
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          
          assert.typeOf(result, 'array', 'Should successfully generate examples');
          
          if (result && result.length > 0) {
            const example = result[0];
            assert.typeOf(example.value, 'string', 'Should have a valid example value');
            
            // Ensure it doesn't contain "Unknown type" which was the reported issue
            assert.notInclude(
              example.value, 
              'unknown-type', 
              'Should not generate unknown-type in examples'
            );
          }
        }, 'Should not throw errors when processing additionalProperties');
      });
    });
  });
});
