import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ExampleGenerator } from '../index.js';
import {
  normalizeXmlTagName,
  processJsonArrayExamples,
} from '../src/ExampleGenerator.js';

/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */

describe('ExampleGenerator', () => {
  const xmlPrefix = '<?xml version="1.0" encoding="UTF-8"?>';

  describe('listMedia()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('Returns list of media types', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.listMedia(payloads);
          assert.deepEqual(result, ['application/json', 'application/xml']);
        });

        it('Returns list of media types when single Payload is passed', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.listMedia(payloads[0]);
          assert.deepEqual(result, ['application/json']);
        });

        it('Returns undefined when no argument', () => {
          const result = element.listMedia();
          assert.isUndefined(result);
        });

        it('Returns undefined when single Payload is not a payload', () => {
          const shape = AmfLoader.lookupType(amf, 'PropertyExamples');
          const result = element.listMedia(shape);
          assert.isUndefined(result);
        });
      });
    });
  });

  describe('generatePayloadsExamples()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('Returns array', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
        });

        it('Returns when single payload has been passed as argument', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
        });

        it('Array has 1 example', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.lengthOf(result, 1);
        });

        it('Example has hasRaw property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].hasRaw, 'boolean');
        });

        it('Example has hasTitle property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].hasTitle, 'boolean');
        });

        it('Example has raw property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].raw, 'string');
        });

        it('Example has value property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].value, 'string');
        });

        it('Example has hasUnion property', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/union', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].hasUnion, 'boolean');
        });

        it('Example has values property', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/union', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result[0].values, 'array');
        });

        it('values property has 2 items', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/union', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.lengthOf(result[0].values, 2);
        });

        it('Generates XML example', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.equal(
            result[0].value.indexOf('<?xml version="1.0" encoding="UTF-8"?>'),
            0
          );
        });

        it('Generates JSON example', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.equal(result[0].value.indexOf('{'), 0);
        });

        it('Skips generating examples from properties when noAuto is set', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/propertyExamples',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json',
            { noAuto: true }
          );
          assert.isUndefined(result);
        });

        it('Returns undefined when when no payload', () => {
          const result = element.generatePayloadsExamples(
            undefined,
            'application/json'
          );
          assert.isUndefined(result);
        });

        it('Returns undefined when when no media type', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/propertyExamples',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads);
          assert.isUndefined(result);
        });

        it('Returns undefined when media type not supported', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/propertyExamples',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'text/plain'
          );
          assert.isUndefined(result);
        });
      });
    });
  });

  describe('generatePayloadExamples()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('Returns array', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
        });

        it('Returns undefined when argument is not set', () => {
          const result = element.generatePayloadsExamples(
            undefined,
            'application/json'
          );
          assert.isUndefined(result);
        });

        it('Returns undefined when argument is a Payload', () => {
          const shape = AmfLoader.lookupType(amf, 'PropertyExamples');
          const result = element.generatePayloadsExamples(
            shape,
            'application/json'
          );
          assert.isUndefined(result);
        });

        it('Generates a value when "rawOnly"', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads[0], null, {
            rawOnly: true,
          });
          assert.typeOf(result, 'array', 'Returns an array');
          assert.lengthOf(result, 1, 'Array is size of 1');
          assert.equal(
            result[0].value.indexOf('error: false'),
            0,
            'Value is set'
          );
        });

        it('Returns undefined when "rawOnly" and no raw values', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/arrayTypeExample',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads[0], null, {
            rawOnly: true,
          });
          assert.isUndefined(result);
        });
      });
    });
  });

  describe('computeExamples()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Computes example from a Payload', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInType',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
        });

        it('Returns example from a Type', () => {
          const shape = AmfLoader.lookupType(amf, 'PropertyExamples');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
        });

        it('Computes example for a ScalarShape', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarWithExample');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isTrue(result[0].hasRaw, 'hasRaw');
          assert.isFalse(result[0].hasTitle, 'hasTitle');
          assert.isFalse(result[0].hasUnion, 'hasUnion');
          assert.equal(result[0].value, 5);
          assert.equal(result[0].raw, '5');
        });

        it('Computes example for a ScalarShape array', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarArrayWithExample');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isTrue(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].value, '[\n  1,\n  5\n]');
        });

        it('Computes example for na ArrayShape', () => {
          const shape = AmfLoader.lookupType(amf, 'ArrayType');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isFalse(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].value, '[{\n  "url": "",\n  "thumb": ""\n}]');
        });

        it('Computes XML example for na ArrayShape', () => {
          const shape = AmfLoader.lookupType(amf, 'ArrayType');
          const result = element.computeExamples(shape, 'application/xml');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isFalse(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(
            result[0].value,
            xmlPrefix +
              '\n<ArrayType>\n  <Image>\n    <url></url>\n    <thumb></thumb>\n  </Image>\n</ArrayType>\n'
          );
        });

        it('Computes example for a PropertyShape', () => {
          const shape = AmfLoader.lookupType(amf, 'Image');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isFalse(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].value, '{\n  "url": "",\n  "thumb": ""\n}');
        });

        it('Computes XML example for a PropertyShape', () => {
          const shape = AmfLoader.lookupType(amf, 'Image');
          const result = element.computeExamples(shape, 'application/xml');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isFalse(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(
            result[0].value,
            xmlPrefix +
              '\n<Image>\n  <url></url>\n  <thumb></thumb>\n</Image>\n'
          );
        });

        it('Computes example for a UnionShape', () => {
          const shape = AmfLoader.lookupType(amf, 'UnionType');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isFalse(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isTrue(result[0].hasUnion);
          assert.typeOf(result[0].values, 'array');
          assert.lengthOf(result[0].values, 2);
          const ex1 = result[0].values[0];
          assert.isFalse(ex1.hasRaw);
          assert.isTrue(ex1.hasTitle);
          assert.isFalse(ex1.hasUnion);
          assert.equal(ex1.title, 'Image');
          assert.equal(ex1.value, '{\n  "url": "",\n  "thumb": ""\n}');
          const ex2 = result[0].values[1];
          assert.isFalse(ex2.hasRaw);
          assert.isTrue(ex2.hasTitle);
          assert.isFalse(ex2.hasUnion);
          assert.equal(ex2.title, 'Imgs');
          assert.equal(
            ex2.value,
            '{\n  "something": "",\n  "images": [\n    {\n      "url": "",\n' +
              '      "thumb": ""\n    }\n  ]\n}'
          );
        });

        it('Computes example for a Scalar value with example', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarWithExample');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isTrue(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].value, 5);
          assert.equal(result[0].raw, '5');
        });

        it('Computes example for a Scalar array value with example', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarArrayWithExample');
          const result = element.computeExamples(shape, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isTrue(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].value, '[\n  1,\n  5\n]');
        });

        it('Computes example from type example', () => {
          const shape = AmfLoader.lookupType(amf, 'JsonExampleInclude');
          const result = element.computeExamples(shape, 'application/json', {
            typeId: shape['@id'],
          });
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
          const ex1 = result[0];
          assert.isFalse(ex1.hasRaw);
          assert.isFalse(ex1.hasTitle);
          assert.isFalse(ex1.hasUnion);
          const parsed1 = JSON.parse(ex1.value);
          const cmp1 = {
            id: 'R34fg663H9KW9MMSKISI',
            name: 'Pawel Psztyc',
            birthday: '1983-10-20',
            gender: 'male',
            url: 'https://domain.com/profile/pawel.psztyc',
            image: {
              thumb: 'https://domain.com/profile/pawel.psztyc/image/thumb',
              url: 'https://domain.com/profile/pawel.psztyc/image',
            },
            tagline: 'Some text about me.',
            language: 'en_GB',
            etag: '"W\\244m4n5kj3gbn2nj4k4n4"',
          };
          assert.deepEqual(parsed1, cmp1);
          const ex2 = result[1];
          assert.isTrue(ex2.hasRaw);
          assert.isFalse(ex2.hasTitle);
          assert.isFalse(ex2.hasUnion);
          const raw =
            'error: false\nid: 1234\nname: Pawel Psztyc\n' +
            'birthday: 20-10-1983\ntagline: Test example\nurl: https://domain.com\n' +
            'language: PL\netag: test\nimage:\n  url: https://image.com\n  ' +
            'thumb: https://image.com/thumb';
          assert.equal(ex2.raw, raw);

          const parsedExample2 = JSON.parse(ex2.value);
          const cmp2 = {
            birthday: '20-10-1983',
            error: false,
            etag: 'test',
            id: 1234,
            image: {
              thumb: 'https://image.com/thumb',
              url: 'https://image.com',
            },
            language: 'PL',
            name: 'Pawel Psztyc',
            tagline: 'Test example',
            url: 'https://domain.com',
          };
          assert.deepEqual(parsedExample2, cmp2);
        });

        it('Computes example from XML type example', () => {
          const shape = AmfLoader.lookupType(amf, 'XmlExampleInclude');
          const result = element.computeExamples(shape, 'application/xml');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
          const ex1 = result[0];
          assert.isFalse(ex1.hasRaw);
          assert.isFalse(ex1.hasTitle);
          assert.isFalse(ex1.hasUnion);
          const str =
            xmlPrefix +
            '\n<Person error="false">\n  ' +
            '<id>Qawer63J73HJ6khjswuqyq62382jG21s</id>\n' +
            '  <name>John Smith</name>\n  <birthday>1990-10-12</birthday>\n  <gender>male</gender>\n  ' +
            '<url>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s</url>\n  <image>\n    ' +
            '<url>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s/image</url>\n    ' +
            '<thumb>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s/image/thumb</thumb>\n  ' +
            "</image>\n  <tagline>Hi, I'm John!</tagline>\n  <language>en_US</language>\n  " +
            '<etag>W\\\\244m4n5kj3gbn2nj4k4n4</etag>\n</Person>\n';
          assert.equal(ex1.value, str);
          const ex2 = result[0];
          assert.isFalse(ex2.hasRaw);
          assert.isFalse(ex2.hasTitle);
          assert.isFalse(ex2.hasUnion);
          const str2 =
            '<?xml version="1.0" encoding="UTF-8"?>\n<Person error="false">\n  ' +
            '<id>Qawer63J73HJ6khjswuqyq62382jG21s</id>\n  <name>John Smith</name>\n  ' +
            '<birthday>1990-10-12</birthday>\n  <gender>male</gender>\n  ' +
            '<url>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s</url>\n  <image>\n    ' +
            '<url>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s/image</url>\n    ' +
            '<thumb>https://www.domain.com/people/Qawer63J73HJ6khjswuqyq62382jG21s/image/thumb</thumb>\n  ' +
            "</image>\n  <tagline>Hi, I'm John!</tagline>\n  <language>en_US</language>\n  " +
            '<etag>W\\\\244m4n5kj3gbn2nj4k4n4</etag>\n</Person>\n';
          assert.equal(ex2.value, str2);
        });

        it('Computes example for an Example shape', () => {
          const shape = AmfLoader.lookupType(amf, 'SimpleInlineExample');
          const key = element._getAmfKey(
            element.ns.aml.vocabularies.apiContract.examples
          );
          const example = element._ensureArray(shape[key])[0];
          const result = element.computeExamples(example, 'application/json');
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.isTrue(result[0].hasRaw);
          assert.isFalse(result[0].hasTitle);
          assert.isFalse(result[0].hasUnion);
          assert.equal(result[0].raw, 'testProperty: true');
          assert.equal(result[0].value, '{\n  "testProperty": true\n}');
        });

        it('Generates a value when "rawOnly"', () => {
          const payloads = AmfLoader.lookupPayloadSchema(
            amf,
            '/IncludedInType',
            'post',
            0
          );
          const result = element.computeExamples(payloads[0], null, {
            rawOnly: true,
          });
          assert.typeOf(result, 'array', 'Returns an array');
          assert.lengthOf(result, 2, 'Array is size of 2');
          assert.equal(
            result[0].value.indexOf('error: false'),
            0,
            'Value is set'
          );
        });

        it('Returns undefined when "rawOnly" and no raw values', () => {
          const payloads = AmfLoader.lookupPayloadSchema(
            amf,
            '/propertyExamples',
            'post',
            0
          );
          const result = element.computeExamples(payloads[0], null, {
            rawOnly: true,
          });
          assert.isUndefined(result);
        });

        it('sets isScalar for a scalar generated value', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarType');
          const result = element.computeExamples(shape, 'application/json');
          assert.isTrue(result[0].isScalar);
        });

        it('sets isScalar for a scalar generated value', () => {
          const shape = AmfLoader.lookupType(amf, 'ScalarWithExample');
          const result = element.computeExamples(shape, 'application/json');
          assert.isTrue(result[0].isScalar);
        });

        it('computes consolidated example for and type', async () => {
          const amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            'allof-types'
          );
          const element = new ExampleGenerator(amf);
          const shape = AmfLoader.lookupType(amf, 'HttpError');
          const result = element.computeExamples(shape, 'application/json', {});
          const example = JSON.parse(result[0].value);
          assert.lengthOf(Object.keys(example), 4);
        });
      });
    });
  });

  describe('Inline defined examples', () => {
    [
      ['DemoAPI: json+ld data model', false],
      ['DemoAPI: Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Returns list of examples defined inline in body', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInlineJson',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });

        it('Returns list of XML examples defined inline in body', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/user-raml-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
        });

        it('Combines inline examples with examples defined in the type', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInline',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
        });

        it('Combines inline XML examples with examples defined in the type', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/IncludedInline',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });

    [
      ['SE-10469: json+ld data model', false, 'SE-10469'],
      ['SE-10469: Compact data model', true, 'SE-10469'],
    ].forEach(([label, compact, file]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            /** @type String */ (file)
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Generates example from schema', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/purina/b2b/supplier/purchaseOrder',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });

  describe('Array examples', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON from scalar array', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/arrayScalar', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.equal(result[0].value, '[0]');
        });

        it('JSON from scalar array with exampels', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/arrayScalarWithExample',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          assert.equal(result[0].value, '[\n  1,\n  2,\n  3\n]');
        });

        it('JSON array property defined inline', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/arrayPropertyExamples',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          const parsed = JSON.parse(result[0].value);
          assert.deepEqual(parsed, [
            {
              xtra: '',
              firstName: 'Pawel',
              lastName: 'Psztyc',
              address: {
                street: '',
                zip: '94100',
                house: 1,
              },
              num: 0,
              int: 0,
              bool: false,
              defVal: 1,
            },
          ]);
        });

        it('XML array property defined inline', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/arrayPropertyExamples',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          const value = `<?xml version="1.0" encoding="UTF-8"?>
<schema>
  <PropertyExamples xtra="string">
    <firstName>Pawel</firstName>
    <lastName>Psztyc</lastName>
    <Address>
      <street></street>
      <zip>94100</zip>
      <house>1</house>
    </Address>
    <num></num>
    <int></int>
    <bool></bool>
    <defVal>1</defVal>
  </PropertyExamples>
</schema>`;
          assert.equal(result[0].value.trim(), value);
        });
      });
    });
  });

  describe('Union examples', () => {
    [
      ['DemoApi: json+ld data model', false],
      ['DemoApi: Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON from union type declared inline', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/union', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);

          assert.typeOf(result[0].values, 'array');
          assert.lengthOf(result[0].values, 2);
          const ex1 = result[0].values[0];
          assert.isTrue(ex1.hasRaw, 'Example 1 hasRaw is true');
          assert.isTrue(ex1.hasTitle, 'Example 1 hasTitle is true');
          assert.isFalse(ex1.hasUnion, 'Example 1 hasUnion is false');
          assert.equal(ex1.title, 'Person', 'Example 1 has title');
          const parsedExample1 = JSON.parse(ex1.value);
          const cmp1 = {
            birthday: '20-10-1983',
            error: false,
            etag: 'test',
            id: 1234,
            image: {
              thumb: 'https://image.com/thumb',
              url: 'https://image.com',
            },
            language: 'PL',
            name: 'Pawel Psztyc',
            tagline: 'Test example',
            url: 'https://domain.com',
          };
          assert.deepEqual(parsedExample1, cmp1, 'Example 1 value is set');
          assert.equal(
            ex1.raw.indexOf('error: false'),
            0,
            'Example 1 raw is set'
          );
          const ex2 = result[0].values[1];
          assert.isFalse(ex2.hasRaw, 'Example 2 hasRaw is false');
          assert.isTrue(ex2.hasTitle, 'Example 2 hasTitle is true');
          assert.isFalse(ex2.hasUnion, 'Example 2 hasUnion is false');
          assert.equal(ex2.title, 'PropertyExamples', 'Example 2 title is set');
          assert.equal(
            ex2.value.indexOf('{\n  "xtra": "",\n  "firstName": "Pawel"'),
            0,
            'Example 2 value is set'
          );
        });

        it('XML from union type declared inline', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/union', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);

          assert.typeOf(result[0].values, 'array');
          assert.lengthOf(result[0].values, 2);
          const ex1 = result[0].values[0];
          assert.isTrue(ex1.hasRaw, 'Example 1 hasRaw is true');
          assert.isTrue(ex1.hasTitle, 'Example 1 hasTitle is true');
          assert.isFalse(ex1.hasUnion, 'Example 1 hasUnion is false');
          assert.equal(ex1.title, 'Person', 'Example 1 has title');
          assert.include(
            ex1.value,
            '<birthday>20-10-1983</birthday>',
            'Example 1 value is set'
          );
          assert.include(
            ex1.raw,
            'birthday: 20-10-1983',
            'Example 1 raw is set'
          );
          const ex2 = result[0].values[1];
          assert.isFalse(ex2.hasRaw, 'Example 2 hasRaw is false');
          assert.isTrue(ex2.hasTitle, 'Example 2 hasTitle is true');
          assert.isFalse(ex2.hasUnion, 'Example 2 hasUnion is false');
          assert.equal(ex2.title, 'PropertyExamples', 'Example 2 title is set');
          assert.include(
            ex2.value,
            '<firstName>Pawel</firstName>',
            'Example 2 value is set'
          );
        });
      });
    });

    [
      ['se-8987: json+ld data model', false, 'se-8987'],
      ['se-8987: Compact data model', true, 'se-8987'],
    ].forEach(([label, compact, file]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            /** @type String */ (file)
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        function testExample1(v1) {
          assert.isTrue(v1.hasTitle, 'v1 hasTitle');
          assert.isTrue(v1.hasRaw, 'v1 hasRaw');
          assert.isFalse(v1.hasUnion, 'v1 hasUnion');
          assert.equal(v1.title, 'Dog', 'v1 title');
          assert.equal(v1.raw.trim(), 'name: Pepe', 'v1 raw');
          assert.equal(v1.value, '{\n  "name": "Pepe"\n}', 'v1 value');
        }

        function testExample2(v1) {
          assert.isTrue(v1.hasTitle, 'v2 hasTitle');
          assert.isTrue(v1.hasRaw, 'v2 hasRaw');
          assert.isFalse(v1.hasUnion, 'v2 hasUnion');
          assert.equal(v1.title, 'Cat', 'v2 title');
          assert.equal(v1.raw.trim(), 'age: 45', 'v2 raw');
          assert.equal(v1.value, '{\n  "age": 45\n}', 'v2 value');
        }

        it('Inline union has examples', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/example1', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
          const values = result[0].values;
          assert.typeOf(values, 'array');
          assert.lengthOf(values, 2);

          const v1 = values[0];
          testExample1(v1);

          const v2 = values[1];
          testExample2(v2);
        });

        // This is wrong, see https://www.mulesoft.org/jira/browse/APIMF-1396
        // it('Type union has examples', () => {
        //   const payloads = AmfLoader.lookupPayload(amf, '/example2', 'post');
        //   const result = element.generatePayloadsExamples(payloads, 'application/json');
        //   assert.typeOf(result, 'array');
        //   assert.lengthOf(result, 1);
        //   const values = result[0].values;
        //   assert.typeOf(values, 'array');
        //   assert.lengthOf(values, 2);
        //
        //   const v1 = values[0];
        //   testExample1(v1);
        //
        //   const v2 = values[1];
        //   testExample2(v2);
        // });
      });
    });
  });

  describe('RAML example defined in payload', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has inherited examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/user-raml-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 4);
        });

        it('XML has no inherited examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/user-raml-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
        });
      });
    });
  });

  describe('RAML array example defined in Type', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/users-raml-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
        });

        it('XML has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/users-raml-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 2);
        });
      });
    });
  });

  describe('RAML JSON example defined in Type', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/user-json-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });

  describe('RAML array JSON example defined in Type', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/users-json-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });

  describe('Named examples', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/named-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });

        it('XML has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/named-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });

  describe('Named examples with internal linking', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('JSON has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/named-linked-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });

        it('XML has type examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/named-linked-example',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });
  describe('_computeScalarType()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        [
          ['String', 'http://www.w3.org/2001/XMLSchema#string'],
          ['Number', 'http://a.ml/vocabularies/shapes#number'],
          ['Integer', 'http://www.w3.org/2001/XMLSchema#integer'],
          ['Boolean', 'http://www.w3.org/2001/XMLSchema#boolean'],
          ['Date', 'http://www.w3.org/2001/XMLSchema#date'],
        ].forEach(item => {
          it(`Returns ${item[0]} type`, () => {
            const shape = {};
            if (compact) {
              shape['shacl:datatype'] = item[1];
            } else {
              shape['http://www.w3.org/ns/shacl#datatype'] = item[1];
            }
            const result = element._computeScalarType(shape);
            assert.equal(result, item[0]);
          });
        });
      });
    });
  });

  describe('_getTypeScalarValue()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('Returns default value of range', () => {
          const range = AmfLoader.lookupTypePropertyRange(amf, 'Address', 1);
          const result = element._getTypeScalarValue(range);
          assert.equal(result, '00000');
        });

        it('Returns example value when no default value', () => {
          const range = AmfLoader.lookupTypePropertyRange(amf, 'Address', 2);
          const result = element._getTypeScalarValue(range);
          assert.equal(result, 1);
        });

        it('Returns undefined otherwise', () => {
          const range = AmfLoader.lookupTypePropertyRange(amf, 'Address', 0);
          const result = element._getTypeScalarValue(range);
          assert.isUndefined(result);
        });
      });
    });
  });

  describe('_computeJsonObjectValue()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Returns object', () => {
          const type = AmfLoader.lookupType(amf, 'Address');
          const result = element._computeJsonObjectValue(type);
          assert.typeOf(result, 'object');
        });

        it('Computes JSON properties', () => {
          const type = AmfLoader.lookupType(amf, 'Address');
          const result = element._computeJsonObjectValue(type);
          assert.equal(result.house, '1');
          assert.equal(result.street, '');
          assert.equal(result.zip, '94100');
        });

        it('Returns empty object when no properties in type', () => {
          const result = element._computeJsonObjectValue({});
          assert.typeOf(result, 'object');
          assert.deepEqual(result, {});
        });
      });
    });
  });
  describe('_jsonFromStructure()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Returns undefined when no structure', () => {
          const result = element._jsonFromStructure();
          assert.isUndefined(result);
        });

        function getStructuredValue(element, type) {
          const key = element._getAmfKey(
            element.ns.raml.vocabularies.apiContract.examples
          );
          let example = element._ensureArray(type[key])[0];
          if (
            element._hasType(
              example,
              element.ns.raml.vocabularies.document + 'NamedExamples'
            )
          ) {
            const key = element._getAmfKey(
              element.ns.raml.vocabularies.apiContract.examples
            );
            example = example[key];
            if (example instanceof Array) {
              example = example[0];
            }
          }
          const svKey = element._getAmfKey(
            element.ns.raml.vocabularies.document + 'structuredValue'
          );
          return element._ensureArray(example[svKey])[0];
        }

        it('Creates example from structure', () => {
          const type = AmfLoader.lookupType(amf, 'JsonExampleInclude');
          const value = getStructuredValue(element, type);
          const result = element._jsonFromStructure(value);
          assert.typeOf(result, 'object');
        });

        it('Creates complext structures', () => {
          const type = AmfLoader.lookupType(amf, 'JsonExampleInclude');
          const value = getStructuredValue(element, type);
          const result = element._jsonFromStructure(value);
          assert.typeOf(result.image, 'object');
        });

        it('Creates example for array structure', () => {
          const type = AmfLoader.lookupType(amf, 'ArrayTypeWithExample');
          const value = getStructuredValue(element, type);
          const result = element._jsonFromStructure(value);
          assert.typeOf(result, 'array');
          assert.deepEqual(result, [{ thumb: 'thumb 1', url: 'url 1' }]);
        });
      });
    });
  });

  describe('_getTypedValue()', () => {
    [
      // ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        let prefix;
        let valueKey;
        let typeKey;
        beforeEach(async () => {
          element = new ExampleGenerator(amf);
          prefix = element._getAmfKey(element.ns.w3.xmlSchema + '');
          valueKey = element._getAmfKey(
            element.ns.raml.vocabularies.data.value
          );
          typeKey = element._getAmfKey(element.ns.w3.shacl.datatype);
        });

        function constructType(type, value) {
          const obj = {};
          obj[valueKey] = [
            {
              '@value': value,
            },
          ];
          obj[typeKey] = [
            {
              '@id': type,
            },
          ];
          return obj;
        }

        function constructShortenedType(type, value) {
          const obj = {};
          obj[valueKey] = value;
          obj[typeKey] = type;
          return obj;
        }

        it('Returns undefined when no @value', () => {
          const result = element._getTypedValue({});
          assert.isUndefined(result);
        });

        it('Returns type for "boolean" (true) - compact', () => {
          const obj = constructType(prefix + 'boolean', 'true');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'boolean');
          assert.isTrue(result);
        });

        it('Returns type for "boolean" (true) - compact - old model', () => {
          const obj = {};
          obj[valueKey] = [
            {
              '@type': prefix + 'boolean',
              '@value': 'true',
            },
          ];
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'boolean');
          assert.isTrue(result);
        });

        it('Returns type for "boolean" (true) - full', () => {
          const obj = constructType(
            element.ns.w3.xmlSchema + 'boolean',
            'true'
          );
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'boolean');
          assert.isTrue(result);
        });

        it('Returns type for "boolean" (false) - compact', () => {
          const obj = constructType(prefix + 'boolean', 'false');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'boolean');
          assert.isFalse(result);
        });

        it('Returns type for "boolean" (false) - full', () => {
          const obj = constructType(
            element.ns.w3.xmlSchema + 'boolean',
            'false'
          );
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'boolean');
          assert.isFalse(result);
        });

        it('Returns type for "nil" - compact', () => {
          const obj = constructType(prefix + 'nil', 'null');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'null');
          assert.equal(result, null);
        });

        it('Returns type for "nil" - full', () => {
          const obj = constructType(element.ns.w3.xmlSchema + 'nil', 'null');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'null');
          assert.equal(result, null);
        });

        it('Returns type for "integer" - compact', () => {
          const obj = constructType(`${prefix}integer`, '10');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'number');
          assert.equal(result, 10);
        });

        it('Returns type for "integer" (false) - full', () => {
          const obj = constructType(`${element.ns.w3.xmlSchema}integer`, '10');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'number');
          assert.equal(result, 10);
        });

        it('Returns type for "number" - compact', () => {
          const obj = constructType(`${prefix}number`, '10');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'number');
          assert.equal(result, 10);
        });

        it('Returns type for "number" (false) - full', () => {
          const obj = constructType(`${element.ns.w3.xmlSchema}number`, '10');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'number');
          assert.equal(result, 10);
        });

        it('Returns 0 when expected number is NaN', () => {
          const obj = constructType(`${prefix}number`, 'test');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'number');
          assert.equal(result, 0);
        });

        it('Returns passed value for anything else', () => {
          const obj = constructType(`${prefix}string`, 'test');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'string');
          assert.equal(result, 'test');
        });

        it('Returns value when type is missing', () => {
          const obj = constructType(undefined, '10');
          const result = element._getTypedValue(obj);
          assert.typeOf(result, 'string');
          assert.equal(result, '10');
        });

        it('Returns empty string value instead of undefined', () => {
          const obj = constructShortenedType(`${prefix}string`, '');
          const result = element._getTypedValue(obj);
          assert.equal(result, '');
        });
      });
    });
  });

  describe('_computeJsonArrayValue()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        let prefix;
        beforeEach(() => {
          element = new ExampleGenerator(amf);
          prefix = element._getAmfKey(element.ns.w3.xmlSchema);
          if (prefix !== element.ns.w3.xmlSchema) {
            prefix += ':';
          }
        });

        it('Returns undefined when no items', () => {
          const result = element._computeJsonArrayValue({});
          assert.isUndefined(result);
        });

        it('Computes value for array range', () => {
          const type = AmfLoader.lookupType(amf, 'ScalarArray');
          const result = element._computeJsonArrayValue(type);
          assert.typeOf(result, 'array');
          assert.lengthOf(result, 1);
        });
      });
    });
  });

  describe('_computeExampleArraySchape()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        let prefix;
        beforeEach(() => {
          element = new ExampleGenerator(amf);
          prefix = element._getAmfKey(element.ns.w3.xmlSchema);
          if (prefix !== element.ns.w3.xmlSchema) {
            prefix += ':';
          }
        });

        it('Returns items example as array (JSON)', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayTypeExample',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json'
          );
          assert.typeOf(result, 'array');
          const decoded = JSON.parse(result[0].value);
          assert.typeOf(decoded, 'array');
          const item = decoded[0];
          assert.equal(item.firstName, 'Pawel');
        });

        it('Returns items example (XML)', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayTypeExample',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.equal(result[0].value[0], '<');
        });

        it('Returns example from properties (JSON)', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayPropertyExamples',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json'
          );
          assert.typeOf(result, 'array');
          const decoded = JSON.parse(result[0].value);
          assert.typeOf(decoded, 'array');
          const item = decoded[0];
          assert.equal(item.firstName, 'Pawel');
        });

        it('Produces examples for complex objects (JSON)', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayPropertyExamples',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json'
          );
          assert.typeOf(result, 'array');
          const decoded = JSON.parse(result[0].value);
          assert.typeOf(decoded, 'array');
          const item = decoded[0];
          assert.equal(item.address.zip, '94100');
        });

        it('Produces example for scalar value', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayScalar',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json'
          );
          assert.equal(result[0].value, '[0]');
        });

        it('Generates example from properties', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayPropertyGeneratedExamples',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json'
          );
          assert.typeOf(result, 'array');
          const decoded = JSON.parse(result[0].value);
          assert.typeOf(decoded, 'array');
          assert.deepEqual(decoded, [{ test: false, other: '' }]);
        });

        it('Generates example from properties for XML', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayPropertyGeneratedExamples',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.equal(
            result[0].value,
            xmlPrefix +
              '\n<items>\n  <test></test>\n  <other></other>\n</items>\n'
          );
        });

        it('Prohibits generation with noAuto', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayPropertyGeneratedExamples',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeExampleArraySchape(
            schema,
            'application/json',
            { noAuto: true }
          );
          assert.isUndefined(result, 'array');
        });

        it('Returns undefined when array does not have items', () => {
          let shape = AmfLoader.lookupType(amf, 'ArrayWithoutItems');
          shape = element._resolve(shape);
          const result = element._computeExampleArraySchape(
            shape,
            'application/json'
          );
          assert.isUndefined(result);
        });
      });
    });
  });

  describe('processJsonArrayExamples()', () => {
    it('Adds brackets to the "value" property', () => {
      const examples = [
        {
          value: 'test',
        },
      ];
      // @ts-ignore
      processJsonArrayExamples(examples);
      assert.equal(examples[0].value, '[test]');
    });

    it('Adds default string value', () => {
      const examples = [
        {
          value: '',
        },
      ];
      // @ts-ignore
      processJsonArrayExamples(examples);
      assert.equal(examples[0].value, '[""]');
    });

    it('Adds brackets to the "value" property of a union', () => {
      const examples = [
        {
          values: [
            {
              value: 'test',
            },
          ],
        },
      ];
      // @ts-ignore
      processJsonArrayExamples(examples);
      assert.equal(examples[0].values[0].value, '[test]');
    });

    it('Adds default string value of an union', () => {
      const examples = [
        {
          values: [
            {
              value: '',
            },
          ],
        },
      ];
      // @ts-ignore
      processJsonArrayExamples(examples);
      assert.equal(examples[0].values[0].value, '[""]');
    });

    it('Ignores entry when no value', () => {
      const examples = [{}];
      // @ts-ignore
      processJsonArrayExamples(examples);
      // no error, coverage
    });
  });

  describe('_computeJsonProperyValue()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        let prefix;
        beforeEach(async () => {
          element = new ExampleGenerator(amf);
          prefix = element._getAmfKey(element.ns.w3.xmlSchema);
          if (prefix !== element.ns.w3.xmlSchema) {
            prefix += ':';
          }
        });

        it('Returns value for scalar type', () => {
          let schema = AmfLoader.lookupPayloadSchema(amf, '/scalar', 'post')[0];
          schema = element._resolve(schema);
          const result = element._computeJsonProperyValue(schema);
          assert.equal(result, '');
        });

        it('Returns value for union type', () => {
          let schema = AmfLoader.lookupPayloadSchema(amf, '/union', 'post')[0];
          schema = element._resolve(schema);
          const result = element._computeJsonProperyValue(schema);
          assert.typeOf(result.birthday, 'string');
        });

        it('Returns value for selected type in union', () => {
          let schema = AmfLoader.lookupPayloadSchema(amf, '/union', 'post')[0];
          schema = element._resolve(schema);
          const result = element._computeJsonProperyValue(
            schema,
            'PropertyExamples'
          );
          assert.typeOf(result.address, 'object');
        });

        it('Returns value for NodeShape', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/IncludedInType',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeJsonProperyValue(schema);
          assert.typeOf(result.birthday, 'string');
        });

        it('Returns value for ArrayShape', () => {
          let schema = AmfLoader.lookupPayloadSchema(
            amf,
            '/arrayTypeExample',
            'post'
          )[0];
          schema = element._resolve(schema);
          const result = element._computeJsonProperyValue(schema);
          assert.typeOf(result, 'array');
          assert.deepEqual(result[0], { firstName: '', lastName: '' });
        });
      });
    });
  });

  describe('JSON schema processing', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            'SE-10469'
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Generates example from JSON schema', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/purina/b2b/supplier/purchaseOrder',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads[0], null, {
            rawOnly: true,
          });
          assert.typeOf(result, 'array');
        });

        it('Example has "raw" property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/purina/b2b/supplier/purchaseOrder',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads[0], null, {
            rawOnly: true,
          });
          const example = result[0];
          assert.typeOf(example.raw, 'string');
          assert.isTrue(example.hasRaw);
        });

        it('Example has "value" property', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/purina/b2b/supplier/purchaseOrder',
            'post'
          );
          const result = element.generatePayloadsExamples(payloads[0], null, {
            rawOnly: true,
          });
          const example = result[0];
          assert.typeOf(example.value, 'string');
        });
      });
    });
  });

  describe('Tracked elements (skipped until next AMF release)', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            'tracked-to-linked'
          );
        });

        beforeEach(() => {
          element = new ExampleGenerator(amf);
        });

        it('Generates example for GET', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/employees', 'get');
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
          const example = result[0];
          assert.isTrue(example.hasTitle, "Example's hasTitle is set");
          assert.isTrue(example.hasRaw, "Example's hasRaw is set");
          assert.isFalse(example.hasUnion, "Example's hasUnion is set");
          assert.equal(example.title, 'employees', "Example's title is set");
          assert.equal(
            example.raw,
            '-\n  id: 1\n  name: Jhon\n-\n  id: 2\n  name: Sam',
            "Example's raw is set"
          );
          assert.equal(
            example.value,
            '[\n  {\n    "id": 1,\n    "name": "Jhon"\n  },\n  {\n    "id": 2,\n    "name": "Sam"\n  }\n]',
            "Example's value is set"
          );
        });

        it('Generates example for POST', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/employees', 'post');
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
          const example = result[0];
          assert.isTrue(example.hasTitle, "Example's hasTitle is set");
          assert.isTrue(example.hasRaw, "Example's hasRaw is set");
          assert.isFalse(example.hasUnion, "Example's hasUnion is set");
          assert.equal(example.title, 'employee', "Example's title is set");
          assert.equal(
            example.raw,
            'id: 1\nname: "Jhon"',
            "Example's raw is set"
          );
          assert.equal(
            example.value,
            '{\n  "id": 1,\n  "name": "Jhon"\n}',
            "Example's value is set"
          );
        });

        it('Generates example for DELETE', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/employees', 'delete');
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/json'
          );
          assert.typeOf(result, 'array');
          const example = result[0];
          assert.isTrue(example.hasTitle, "Example's hasTitle is set");
          assert.isTrue(example.hasRaw, "Example's hasRaw is set");
          assert.isFalse(example.hasUnion, "Example's hasUnion is set");
          assert.equal(example.title, 'employee', "Example's title is set");
          assert.equal(
            example.raw,
            'id: 1\nname: "Jhon"',
            "Example's raw is set"
          );
          assert.equal(
            example.value,
            '{\n  "id": 1,\n  "name": "Jhon"\n}',
            "Example's value is set"
          );
        });

        it('Generates example for HEAD', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/employees', 'head');
          const result = element.generatePayloadsExamples(
            payloads[0],
            'application/xml'
          );
          assert.typeOf(result, 'array');
          const example = result[0];
          assert.isTrue(example.hasTitle, "Example's hasTitle is set");
          assert.isTrue(example.hasRaw, "Example's hasRaw is set");
          assert.isFalse(example.hasUnion, "Example's hasUnion is set");
          assert.equal(example.title, 'employee', "Example's title is set");
          assert.equal(
            example.raw,
            'id: 1\nname: "Jhon"',
            "Example's raw is set"
          );
          assert.equal(
            example.value,
            '<?xml version="1.0" encoding="UTF-8"?>\n<Employee>\n  <id>1</id>\n  <name>Jhon</name>\n</Employee>\n',
            "Example's value is set"
          );
        });
      });
    });
  });

  describe('Data types examples', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        [
          ['typeString', 'string', 'String example'],
          ['typeNumber', 'number', 123456],
          ['typeInt', 'number', 1234546],
          ['typeDecimal', 'number', 10.67],
          ['typeBool', 'boolean', true],
          // ['typeNull', 'null', null], <-- AMF does not produce example value for this.
          ['typeNegativeInt', 'number', -12],
          ['typeNumberFormatInt64', 'number', 8],
          ['typeIntFormatInt8', 'number', 12],
          ['typeNumFormatInt32', 'number', 109298],
          ['typeNumFormatInt', 'number', 11],
          ['typeNumFormatLong', 'number', 123456789],
          ['typeNumFormatFloat', 'number', 1234567.89],
          ['typeNumFormatDouble', 'number', 1234.56789],
          ['typeNumFormatInt8', 'number', 1],
          ['typeNumFormatInt16', 'number', 2],
        ].forEach(item => {
          it(`Returns ${item[1]} type (${item[0]})`, () => {
            const type = /** @type string */ (item[0]);
            const datatype = /** @type string */ (item[1]);

            const shape = AmfLoader.lookupType(amf, 'DataTypesExample');
            const result = element.computeExamples(shape, 'application/json');
            const data = JSON.parse(result[0].value);

            assert.typeOf(data[type], datatype, 'Data type matches');
            assert.equal(data[type], item[2], 'Value matches');
          });
        });
      });
    });
  });

  describe('Data types - APIC-187', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            'APIC-187'
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        [
          ['AS400CityName', 'string', 'Omaha, DG'],
          ['AS400ECM', 'number', 401571.6],
          ['AcquiredDate', 'string', '2019-01-16'],
          ['Age', 'number', 1],
          ['TransmissionRearRearSN', 'string', '1'],
          ['TransmissionRearRatio', 'number', 1],
          ['Weight', 'number', 9300],
          ['Year', 'string', '2016'],
        ].forEach(item => {
          it(`Returns ${item[1]} type (${item[0]})`, () => {
            const datatype = /** @type string */ (item[1]);
            const shape = AmfLoader.lookupPayloadSchema(
              amf,
              '/record',
              'post',
              0
            );
            const result = element.computeExamples(
              shape[0],
              'application/json'
            );
            const data = JSON.parse(result[0].value);

            assert.typeOf(
              data.records[0][item[0]],
              datatype,
              'Data type matches'
            );
            assert.equal(data.records[0][item[0]], item[2], 'Value matches');
          });
        });
      });
    });
  });

  describe('Falsy data types', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;

        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            'APIC-188'
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('False example is computed', () => {
          const payloads = AmfLoader.lookupPayload(amf, '/record', 'post');
          const result = element.generatePayloadsExamples(
            payloads,
            'application/json'
          );
          const data = JSON.parse(result[0].value);
          assert.isFalse(data.allOrNone);
          assert.typeOf(data.records, 'array');
        });
      });
    });
  });

  describe('_appendXmlElement()', () => {
    [
      ['json+ld data model', false],
      ['Compact data model', true],
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element;
        let amf;
        let doc;
        let main;

        before(async () => {
          amf = await AmfLoader.load(/** @type Boolean */ (compact));
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);

          doc = document.implementation.createDocument('', 'test', null);
          main = doc.documentElement;
        });

        it('Does nothing when no name', () => {
          element._appendXmlElement(doc, main, {});
          const s = new XMLSerializer();
          const result = s.serializeToString(doc);
          assert.match(result, /<test\s?\/>/);
        });

        it('Normalizes name', () => {
          const key = element._getAmfKey(element.ns.w3.shacl.name);
          const range = {};
          range[key] = [
            {
              '@value': 'gender?',
            },
          ];
          element._appendXmlElement(doc, main, range);
          const node = doc.querySelector('gender');
          assert.ok(node);
        });
      });
    });
  });

  describe('_computeStructuredExampleValue()', () => {
    let baseObj;
    let valueKey;
    let element;
    let model;
    before(async () => {
      model = await AmfLoader.load();
    });

    beforeEach(async () => {
      element = new ExampleGenerator(model);
      const typeKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'Scalar'
      );
      valueKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'value'
      );
      baseObj = {};
      baseObj['@type'] = [typeKey];
      baseObj[valueKey] = [
        {
          '@type': '',
          '@value': '',
        },
      ];
    });

    it('Returns null when no argument', () => {
      const result = element._computeStructuredExampleValue();
      assert.equal(result, null);
    });

    it('Returns the same value as argument when string', () => {
      const result = element._computeStructuredExampleValue('test');
      assert.equal(result, 'test');
    });

    it('Returns boolean value - true (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'boolean';
      baseObj[valueKey][0]['@value'] = 'true';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'boolean');
      assert.isTrue(result);
    });

    it('Returns boolean value - false (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'boolean';
      baseObj[valueKey][0]['@value'] = 'false';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'boolean');
      assert.isFalse(result);
    });

    it('Returns numeric value for integer (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'integer';
      baseObj[valueKey][0]['@value'] = '10';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'number');
      assert.equal(result, 10);
    });

    it('Returns numeric value for long (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'long';
      baseObj[valueKey][0]['@value'] = '1000000000';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'number');
      assert.equal(result, 1000000000);
    });

    it('Returns numeric value for double (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'double';
      baseObj[valueKey][0]['@value'] = '12.1234';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'number');
      assert.equal(result, 12.1234);
    });

    it('Returns numeric value for float (full key)', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'float';
      baseObj[valueKey][0]['@value'] = '12.1234';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'number');
      assert.equal(result, 12.1234);
    });

    it('Returns string otherwise', () => {
      baseObj[valueKey][0]['@type'] = element.ns.w3.xmlSchema + 'string';
      baseObj[valueKey][0]['@value'] = 'test';
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'string');
      assert.equal(result, 'test');
    });
  });

  describe('_computeExampleFromStructuredValue()', () => {
    let element;
    let model;
    before(async () => {
      model = await AmfLoader.load(true);
    });

    beforeEach(async () => {
      element = new ExampleGenerator(model);
    });

    function createProperty(type, value) {
      const typeKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'Scalar'
      );
      const valueKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'value'
      );
      const baseObj = {};
      baseObj['@type'] = [typeKey];
      baseObj[valueKey] = [
        {
          '@type': type,
          '@value': value,
        },
      ];
      return baseObj;
    }

    it('returns scalar value', () => {
      const valueKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'value'
      );
      const baseObj = {};
      baseObj[valueKey] = ['test'];
      const result = element._computeStructuredExampleValue(baseObj);
      assert.equal(result, 'test');
    });

    it('returns an object for an object type', () => {
      const typeKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'Object'
      );
      const baseObj = {};
      baseObj['@type'] = [typeKey];

      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'object');
    });

    it('returns an array for non-object type', () => {
      const baseObj = {};
      baseObj['@type'] = [];
      const result = element._computeStructuredExampleValue(baseObj);
      assert.typeOf(result, 'array');
    });

    it('returns example value for a property', () => {
      const typeKey = element._getAmfKey(
        element.ns.raml.vocabularies.data + 'Object'
      );
      const baseObj = {};
      baseObj['@type'] = [typeKey];
      baseObj.test = [
        createProperty(element.ns.w3.xmlSchema + 'string', 'test'),
      ];
      const result = element._computeStructuredExampleValue(baseObj);
      assert.deepEqual(result, { test: 'test' });
    });
  });

  describe('normalizeXmlTagName()', () => {
    it('removes prohibited characters', () => {
      const name = 'a & b = c?';
      const result = normalizeXmlTagName(name);
      assert.equal(result, 'abc');
    });

    it('keeps hyphen characters', () => {
      const name = 'a-&-b =-c?';
      const result = normalizeXmlTagName(name);
      assert.equal(result, 'a--b-c');
    });

    it('keeps underscoer characters', () => {
      const name = 'a_&_b =_c?';
      const result = normalizeXmlTagName(name);
      assert.equal(result, 'a__b_c');
    });

    it('keeps dot characters', () => {
      const name = 'a.&.b =.c?';
      const result = normalizeXmlTagName(name);
      assert.equal(result, 'a..b.c');
    });
  });

  describe('APIC-391', () => {
    let element;
    let amf;

    [
      ['APIC-391: json+ld data model', false, 'APIC-391'],
      ['APIC-391: json+ld data model', true, 'APIC-391'],
    ].forEach(([label, compact, file]) => {
      describe(String(label), () => {
        before(async () => {
          amf = await AmfLoader.load(
            /** @type Boolean */ (compact),
            /** @type String */ (file)
          );
        });

        beforeEach(async () => {
          element = new ExampleGenerator(amf);
        });

        it('Should generate XML tags correctly for payloads examples', () => {
          const payloads = AmfLoader.lookupPayload(
            amf,
            '/shipment-requests',
            'post'
          );
          const result = element.generatePayloadsExamples(
            payloads,
            'application/xml'
          );
          assert.typeOf(result, 'array');
          assert.equal(
            result[0].value,
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
              '<unknown-type>\n' +
              '  <address>250 HIDEOUT LN</address>\n' +
              '  <comments>Orgin comments entered here.</comments>\n' +
              '  <references>\n' +
              '    <reference>\n' +
              '      <referenceType>Delivery Note</referenceType>\n' +
              '      <referenceValue>7328</referenceValue>\n' +
              '    </reference>\n' +
              '  </references>\n' +
              '</unknown-type>\n'
          );
        });
      });
    });
  });

  describe('Compact number', () => {
    it('should call _computeScalarType() and return "Number"', () => {
      const amf = {
        '@context': {
          shacl: 'http://www.w3.org/ns/shacl#',
          shapes: 'http://a.ml/vocabularies/shapes#',
        },
      };
      const type = {
        'shacl:datatype': {
          '@id': 'shapes:number',
        },
      };

      const element = new ExampleGenerator(amf);
      assert.equal(element._computeScalarType(type), 'Number');
    });
  });
});
