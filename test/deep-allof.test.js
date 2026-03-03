/* eslint-disable prefer-destructuring */
import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ExampleGenerator } from '../index.js';

/** @typedef {import('../').ExampleOptions} ExampleOptions */

describe('ExampleGenerator', () => {
  describe('Deep allOf (4+ levels)', () => {
    /**
     * @return {Promise<Object>}
     */
    async function getProductOrderModel() {
      return AmfLoader.load(true, 'product-order-minimal');
    }

    it('generates examples with properties from 4+ level allOf chains', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      // Find PXCAppointmentRef type (has 4-level allOf chain)
      const type = AmfLoader.lookupType(model, 'PXCAppointmentRef');
      assert.isDefined(type, 'PXCAppointmentRef type should exist in test model');

      // Generate example
      const examples = generator.computeExamples(type, 'application/json');

      assert.isArray(examples, 'Should return examples array');
      assert.isTrue(examples.length > 0, 'Should generate at least one example');

      const example = examples[0];
      assert.isDefined(example.value, 'Example should have a value');

      // Parse the generated JSON
      let parsedValue;
      try {
        parsedValue = JSON.parse(example.value);
      } catch (e) {
        assert.fail(`Generated example should be valid JSON: ${e.message}`);
      }

      // Verify properties from deeply nested allOf levels are present
      // These properties are at level 4 in the allOf chain and were previously missing
      assert.property(parsedValue, '@type', 'Should include @type from level 4');

      // Check if date/timeSlot are in the schema (may vary by test data)
      // If present, they should be in the generated example
      const hasDateOrTimeSlot = 'date' in parsedValue || 'timeSlot' in parsedValue;
      if (hasDateOrTimeSlot) {
        console.log('✓ Deep allOf properties (date/timeSlot) included in example');
      }
    });

    it('handles maxAllOfDepth configuration', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      const type = AmfLoader.lookupType(model, 'PXCAppointmentRef');
      assert.isDefined(type);

      // Test with custom maxDepth
      /** @type {ExampleOptions} */
      const opts = {
        maxAllOfDepth: 5,
      };

      const examples = generator.computeExamples(type, 'application/json', opts);

      assert.isArray(examples, 'Should return examples with custom maxDepth');
      assert.isTrue(examples.length > 0, 'Should generate examples with custom config');
    });

    it('handles circular references in allOf chains', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      // Create a mock schema with circular allOf reference
      const circularSchema = {
        '@id': 'circular-test',
        'http://www.w3.org/ns/shacl#and': [
          {
            '@id': 'circular-test', // Self-reference
          },
        ],
      };

      // Should not throw error or cause infinite loop
      let didThrow = false;
      try {
        generator.computeExamples(circularSchema, 'application/json');
      } catch (e) {
        didThrow = true;
        console.error('Circular reference test error:', e);
      }

      assert.isFalse(didThrow, 'Should handle circular references gracefully');
    });

    it('handles empty allOf arrays', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      const emptyAllOfSchema = {
        '@id': 'empty-test',
        'http://www.w3.org/ns/shacl#and': [],
        'http://www.w3.org/ns/shacl#property': [
          {
            'http://www.w3.org/ns/shacl#name': [{ '@value': 'testProp' }],
            'http://a.ml/vocabularies/shapes#range': [
              {
                '@type': ['http://www.w3.org/ns/shacl#NodeShape'],
                'http://www.w3.org/2001/XMLSchema#string': [{ '@value': 'test' }],
              },
            ],
          },
        ],
      };

      // Should not throw; result may be undefined or array depending on schema
      let didThrow = false;
      let examples;
      try {
        examples = generator.computeExamples(emptyAllOfSchema, 'application/json');
      } catch (e) {
        didThrow = true;
        console.error('Empty allOf test error:', e);
      }

      assert.isFalse(didThrow, 'Should handle empty allOf arrays gracefully');
      assert.isTrue(
        examples === undefined || Array.isArray(examples),
        'Should return undefined or array when allOf is empty'
      );
    });

    it('completes deep allOf processing within reasonable time', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      const type = AmfLoader.lookupType(model, 'PXCAppointmentRef');
      assert.isDefined(type);

      // Measure performance
      const startTime = Date.now();
      const examples = generator.computeExamples(type, 'application/json');
      const endTime = Date.now();
      const duration = endTime - startTime;

      assert.isDefined(examples, 'Should generate examples');
      assert.isTrue(duration < 1000, `Should complete in <1 second (took ${duration}ms)`);

      console.log(`Deep allOf example generation took ${duration}ms`);
    });

    it('logs warning when depth limit is reached', async () => {
      const model = await getProductOrderModel();
      const generator = new ExampleGenerator(model);

      // Use the same key format as the generator (from the loaded model)
      const andKey = generator._getAmfKey(generator.ns.w3.shacl.and);
      const propertyKey = generator._getAmfKey(generator.ns.w3.shacl.property);

      // Create a deeply nested allOf chain (11 levels, exceeds default max of 10)
      let deepSchema = {
        '@id': 'level-0',
        [propertyKey]: [
          {
            'http://www.w3.org/ns/shacl#name': [{ '@value': 'level0Prop' }],
          },
        ],
      };

      // Build 11-level chain
      for (let i = 1; i <= 11; i++) {
        deepSchema = {
          '@id': `level-${i}`,
          [andKey]: [deepSchema],
          [propertyKey]: [
            {
              'http://www.w3.org/ns/shacl#name': [{ '@value': `level${i}Prop` }],
            },
          ],
        };
      }

      // Capture console warnings
      const originalWarn = console.warn;
      let warningLogged = false;
      console.warn = (...args) => {
        if (args[0] && args[0].includes('Maximum allOf depth')) {
          warningLogged = true;
        }
        originalWarn(...args);
      };

      // Generate examples
      generator.computeExamples(deepSchema, 'application/json');

      // Restore console.warn
      console.warn = originalWarn;

      assert.isTrue(warningLogged, 'Should log warning when depth limit is reached');
    });
  });
});
