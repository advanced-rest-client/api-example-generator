import { LitElement } from 'lit-element';
import { ExampleGenerator } from './ExampleGenerator.js';

/**
 * @deprecated This custom element is deprecated. Use `ExampleGenerator` instead
 */
export class ApiExampleGenerator extends LitElement {
  constructor() {
    super();
    this._generator = new ExampleGenerator();
  }

  get ns() {
    return this._generator.ns;
  }

  get amf() {
    return this._generator.amf;
  }

  set amf(value) {
    this._generator.amf = value;
  }

  _getAmfKey(k) {
    return this._generator._getAmfKey(k);
  }

  _ensureArray(k) {
    return this._generator._ensureArray(k);
  }

  _resolve(k) {
    return this._generator._resolve(k);
  }
  
  _hasType(k, v) {
    return this._generator._hasType(k, v);
  }

  listMedia(payloads) {
    return this._generator.listMedia(payloads);
  }

  generatePayloadsExamples(payloads, media, opts) {
    return this._generator.generatePayloadsExamples(payloads, media, opts);
  }

  generatePayloadExamples(payload, mime, opts) {
    return this._generator.generatePayloadExamples(payload, mime, opts);
  }

  computeExamples(schema, mime, opts) {
    return this._generator.computeExamples(schema, mime, opts);
  }

  _readJsonSchema(schema) {
    return this._generator._readJsonSchema(schema);
  }

  _computeFromExamples(examples, mime, opts) {
    return this._generator._computeFromExamples(examples, mime, opts);
  }

  _processExamples(examples) {
    return this._generator._processExamples(examples);
  }

  _listTypeExamples(examples, typeId) {
    return this._generator._listTypeExamples(examples, typeId);
  }

  _generateFromExample(example, mime, opts) {
    return this._generator._generateFromExample(example, mime, opts);
  }

  _computeExampleArraySchape(schema, mime, opts) {
    return this._generator._computeExampleArraySchape(schema, mime, opts);
  }

  _processJsonArrayExamples(examples) {
    return this._generator._processJsonArrayExamples(examples);
  }

  _computeUnionExamples(schema, mime, opts) {
    return this._generator._computeUnionExamples(schema, mime, opts);
  }

  _computeScalarType(shape) {
    return this._generator._computeScalarType(shape);
  }

  _jsonFromStructure(structure) {
    return this._generator._jsonFromStructure(structure);
  }

  _jsonFromStructureValue(value, obj, isArray, key, resolvedPrefix) {
    return this._generator._jsonFromStructureValue(value, obj, isArray, key, resolvedPrefix);
  }

  _xmlFromStructure(structure, opts) {
    return this._generator._xmlFromStructure(structure, opts);
  }

  formatXml(xml) {
    return this._generator.formatXml(xml);
  }

  _getTypedValue(structure) {
    return this._generator._getTypedValue(structure);
  }

  _exampleFromJsonSchema(schema, jsonSchema) {
    return this._generator._exampleFromJsonSchema(schema, jsonSchema);
  }

  _exampleFromProperties(properties, mime, typeName, parentType) {
    return this._generator._exampleFromProperties(properties, mime, typeName, parentType);
  }

  _jsonExampleFromProperties(properties) {
    return this._generator._jsonExampleFromProperties(properties);
  }

  _computeJsonProperyValue(range, typeName) {
    return this._generator._computeJsonProperyValue(range, typeName);
  }

  _typeToValue(value, type) {
    return this._generator._typeToValue(value, type);
  }

  _computeJsonUnionValue(range, typeName) {
    return this._generator._computeJsonUnionValue(range, typeName);
  }

  _computeJsonObjectValue(range) {
    return this._generator._computeJsonObjectValue(range);
  }

  _computeJsonArrayValue(range) {
    return this._generator._computeJsonArrayValue(range);
  }

  _extractExampleRawValue(example) {
    return this._generator._extractExampleRawValue(example);
  }

  _getTypeScalarValue(range) {
    return this._generator._getTypeScalarValue(range);
  }

  _xmlExampleFromProperties(properties, typeName, parentType) {
    return this._generator._xmlExampleFromProperties(properties, typeName, parentType);
  }

  _xmlProcessProperty(doc, node, property) {
    return this._generator._xmlProcessProperty(doc, node, property);
  }

  _xmlFromExamples(doc, node, example, propertyName) {
    return this._generator._xmlFromExamples(doc, node, example, propertyName);
  }

  _readDataType(shape) {
    return this._generator._readDataType(shape);
  }

  _appendXmlAttribute(node, property, range, serialization) {
    return this._generator._appendXmlAttribute(node, range, serialization);
  }

  _appendXmlElement(doc, node, range) {
    return this._generator._appendXmlElement(doc, node, range);
  }

  _appendXmlElements(doc, node, property, range) {
    return this._generator._appendXmlElements(doc, node, range);
  }

  _appendXmlArray(doc, node, property, range, isWrapped) {
    return this._generator._appendXmlArray(doc, node, range, isWrapped);
  }

  _xmlProcessUnionScalarProperty(doc, node, property, shape) {
    return this._generator._xmlProcessUnionScalarProperty(doc, property, shape);
  }

  _normalizeXmlTagName(name) {
    return this._generator._normalizeXmlTagName(name);
  }

  _xmlProcessDataProperty(doc, node, property, name) {
    return this._generator._xmlProcessDataProperty(doc, node, property, name);
  }

  _computeExampleFromStructuredValue(model) {
    return this._generator._computeExampleFromStructuredValue(model);
  }

  _computeStructuredExampleValue(model) {
    return this._generator._computeStructuredExampleValue(model);
  }

  _processDataArrayProperties(doc, node, property, name) {
    return this._generator._processDataArrayProperties(doc, node, property, name);
  }

  _processDataObjectProperties(doc, node, property) {
    return this._generator._processDataObjectProperties(doc, node, property);
  }

  _dataNameFromKey(key) {
    return this._generator._dataNameFromKey(key);
  }
}
