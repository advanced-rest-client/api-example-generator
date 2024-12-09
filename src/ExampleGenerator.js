/* eslint-disable class-methods-use-this */
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable prefer-template */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */

const UNKNOWN_TYPE = 'unknown-type';

/** @typedef {import('./types').Example} Example */
/** @typedef {import('./types').ExampleOptions} ExampleOptions */
/** @typedef {import('./types').XmlData} XmlData */

/**
 * Reads property name from AMF's "data" item. The key is an object key
 * that has a form of "data uri#property name" or "data:property name".
 * This depends on whether the model is compact or not.
 *
 * @param {string} key Key name to process
 * @return {string} Name of the data property
 */
export const dataNameFromKey = key => {
  let value = String(key);
  let index = value.indexOf('#');
  if (index !== -1) {
    value = value.substr(index + 1);
  } else {
    index = value.indexOf(':');
    if (index !== -1) {
      value = value.substr(index + 1);
    }
  }
  return value;
};

/**
 * Normalizes given name to a value that can be accepted by `createElement`
 * function on a document object.
 * @param {string} name A name to process
 * @return {string} Normalized name
 */
export const normalizeXmlTagName = name => name.replace(/[^a-zA-Z0-9-_.]/g, '');

/**
 * Formats XML string into pretty printed value.
 * https://stackoverflow.com/a/2893259/1127848
 * @param {String} xml The XML to process
 * @return {String} Formatted XML
 */
export const formatXml = xml => {
  const reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
  const wsExp = / *(.*) +\n/g;
  const contExp = /(<.+>)(.+\n)/g;
  xml = xml
    .replace(reg, '$1\n$2$3')
    .replace(wsExp, '$1\n')
    .replace(contExp, '$1\n$2');
  let formatted = '';
  const lines = xml.split('\n');
  let indent = 0;
  let lastType = 'other';
  // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
  const transitions = {
    'single->single': 0,
    'single->closing': -2,
    'single->opening': 0,
    'single->other': 0,
    'closing->single': 0,
    'closing->closing': -2,
    'closing->opening': 0,
    'closing->other': 0,
    'opening->single': 2,
    'opening->closing': 0,
    'opening->opening': 2,
    'opening->other': 2,
    'other->single': 0,
    'other->closing': -2,
    'other->opening': 0,
    'other->other': 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.match(/\s*<\?xml/)) {
      formatted += ln + '\n';
      continue;
    }
    const single = Boolean(ln.match(/<.+\/>/));
    const closing = Boolean(ln.match(/<\/.+>/));
    const opening = Boolean(ln.match(/<[^!].*>/));
    const type = single
      ? 'single'
      : closing
        ? 'closing'
        : opening
          ? 'opening'
          : 'other';
    const fromTo = lastType + '->' + type;
    lastType = type;
    let padding = '';
    indent += transitions[fromTo];
    for (let j = 0; j < indent; j++) {
      padding += ' ';
    }
    if (fromTo === 'opening->closing') {
      formatted = formatted.substr(0, formatted.length - 1) + ln + '\n';
    } else {
      formatted += padding + ln + '\n';
    }
  }
  return formatted;
};

/**
 * Processes example for unions which has array of values.
 * @param {Example[]} values
 */
export const processValuesArrayExample = values => {
  for (let i = 0; i < values.length; i++) {
    if (values[i].value !== undefined && values[i].value[0] !== '[') {
      if (values[i].value === '') {
        values[i].value = '""';
      }
      values[i].value = `[${values[i].value}]`;
    }
  }
};

/**
 * Processes JSON examples that should be an arrays and adds brackets
 * if necessary. When the example is empty string it adds empty string literal
 * to the example value.
 * It does the same for unions which has array of values.
 * @param {Example[]} examples
 */
export const processJsonArrayExamples = examples => {
  for (let i = 0; i < examples.length; i++) {
    const item = examples[i];
    if (item.values) {
      processValuesArrayExample(item.values);
    } else if (item.value !== undefined && item.value[0] !== '[') {
      if (item.value === '') {
        item.value = '""';
      } else {
        let isJson
        try {
          // @ts-ignore
          JSON.parse(item.value)
          isJson = true
        } catch (e) {
          isJson = false
        }
        if (!isJson) {
          item.value = '"' + item.value + '"'
        }
      }
      item.value = '[' + item.value + ']';
    }
  }
};

/**
 * Examples generator from AMF model.
 *
 * ## Data model
 *
 * The result of calling `generatePayloadsExamples()`, `generatePayloadExamples()`,
 * or `computeExamples()` is an array of view models.
 *
 * ### ExampleModel
 *
 * - **hasRaw** `Boolean` - if true then `raw` property has a value
 * - **hasTitle** `Boolean` - if true then `title` property has a value
 * - **hasUnion** `Boolean` - if true then `values` property has a value
 * - **value** `String`, Optional - Example to render
 * - **title** - `String`, Optional - Example name, only when `hasTitle` is set
 * - **raw** `String`, Optional - Raw value of RAML example. This value is a
 * YAML or JSON schema value. This is only set when raw value is available in
 * the model and it is not JSON/XML.
 * - **values** `Array<ExampleModel>`, Optional - Only when `hasUnion` is set.
 *
 * ## Usage
 *
 * To generate examples for a list payloads
 *
 * ```javascript
 * const supportedOperation = {...}; // definition of AMF supported operation
 * const payloads = getPayloads(supportedOperation); // Extract array of payloads from e.g. Expects
 * const mediaTypes = generator.listMedia(payloads);
 * const examples = generator.generatePayloadsExamples(payloads, mediaTypes[0]);
 * console.log(examples);
 * ```
 *
 * To generate examples from a payload
 *
 * ```javascript
 * const examples = generator.generatePayloadExamples(payloads[0], 'application/json');
 * console.log(examples);
 * ```
 *
 * To generate examples from any object to any mime
 *
 * ```javascript
 * const shape = getTypeDeclaration(); // gets type definition
 * const examples = generator.computeExamples(shape, 'application/json');
 * console.log(examples);
 * ```
 *
 * ## Processing options
 *
 * - `rawOnly` - list "raw" examples only.
 * - `noAuto` - Don't generate an example from object properties if the example is
 * not defined in API file.
 * - `typeName` - Processed type name, used for XML types to use right XML element wrapper name.
 *
 * @mixes AmfHelperMixin
 */
export class ExampleGenerator extends AmfHelperMixin(Object) {
  /**
   * @param {any=} amf The AMF model.
   */
  constructor(amf) {
    super();
    /**
     * The AMF model.
     * @type {any}
     */
    this.amf = amf;
  }

  /**
   * Lists media types names for payloads.
   * The `payloads` is an array of AMF Payload shape. It can be single Payload
   * shape as a convenient method for compact model.
   *
   * @param {Array<Object>|Object} payloads List of payloads AMF's Request shape.
   * @return {Array<string>|undefined} Returns a list of mime types or undefined
   * if not found.
   */
  listMedia(payloads) {
    if (!payloads) {
      return undefined;
    }
    const { apiContract, core } = this.ns.aml.vocabularies;
    const result = [];
    if (!Array.isArray(payloads)) {
      if (!this._hasType(payloads, apiContract.Payload)) {
        return undefined;
      }
      const item = /** @type {string} */ (this._getValue(payloads, core.mediaType));
      result.push(item);
    } else {
      for (let i = 0; i < payloads.length; i++) {
        const payload = this._resolve(payloads[i]);
        const mime = /** @type {string} */ (this._getValue(payload, core.mediaType));
        result[result.length] = mime;
      }
    }

    return result;
  }

  /**
   * Generates a list of examples from an AMF Payloads array for a given media type.
   * The shape can be an Example in which case it will return the example value.
   * If the shape is other shape than Example shape then it looks for examples array and
   * use it to generate values. Otherwise it tries to generate an example from
   * object properties (if object).
   *
   * @param {Array<Object>|Object} payloads List of payloads to process.
   * @param {String} media A media to for which to generate the examples.
   * @param {ExampleOptions=} opts
   * @return {Array<Example>|undefined} Example value.
   */
  generatePayloadsExamples(payloads, media, opts = {}) {
    let data = payloads;
    if (!data || (!media && !opts.rawOnly)) {
      return undefined;
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    let result;
    for (let i = 0, len = data.length; i < len; i++) {
      const payload = data[i];
      const payloadMedia = this._getValue(
        payload,
        this.ns.aml.vocabularies.core.mediaType
      );
      if (media && payloadMedia !== media) {
        continue;
      }
      result = this.generatePayloadExamples(payload, media, opts);
      break;
    }
    return result;
  }

  /**
   * Generates a list of examples for a single AMF Payload shape.
   * @param {Object} payload AMF Payload shape.
   * @param {String} mime A mime type to use.
   * @param {ExampleOptions=} opts
   * @return {Array<Example>|undefined} List of examples.
   */
  generatePayloadExamples(payload, mime, opts = {}) {
    if (!this._hasType(payload, this.ns.aml.vocabularies.apiContract.Payload)) {
      return undefined;
    }
    this._resolve(payload);
    const sKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    let schema = payload[sKey];
    if (!schema) {
      return undefined;
    }
    if (Array.isArray(schema)) {
      [schema] = schema;
    }
    const options = { ...opts, typeId: payload['@id'] };
    return this.computeExamples(schema, mime, options);
  }

  /**
   * List all properties from schema
   *
   * @param {Object} schema Any AMF schema.
   * @return {Array<Object>|undefined}
   */
  _listProperties(schema) {
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    const properties = this._ensureArray(schema[pKey]);
    if (properties) {
      return properties;
    }

    const iKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.items);
    const items = this._ensureArray(schema[iKey]);
    if (items) {
      return this._listProperties(items[0]);
    }

    const aKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
    const anyOf = this._ensureArray(schema[aKey]);
    if (anyOf) {
      const result = [];
      for (let i = 0; i < anyOf.length; i++) {
        const props = this._listProperties(anyOf[i]);
        if (props) {
          result.push(...props);
        }
      }
      return result;
    }

    return undefined;
  }

  computeTypeName(schema, xmlName) {
    const typeName = /** @type string */ (this._getValue(
      schema,
      this.ns.w3.shacl.name
    ));

    if (xmlName) {
      return xmlName;
    }
    if (typeName && typeName.indexOf('amf_inline_type') !== 0) {
      return typeName;
    }

    return undefined;
  }

  /**
   * Computes examples from an AMF shape.
   * It returns examples defined in API spec file. If examples are not defined
   * and `opts.noAuto` flag is not set then it generates an example value from
   * object properties (if an object represents scalar, object, union, or an array).
   *
   * @param {Object} schema Any AMF schema.
   * @param {string} mime Examples media type. Currently `application/json` and
   * `application/xml` are supported.
   * @param {Object=} [opts={}] Generation options. See `generatePayloadsExamples()`.
   * Besides that, `opts.typeId` is required to compute examples for a payload.
   * The `typeId` is a value of `@id` of the Payload shape.
   * @return {Array<Object>|undefined}
   */
  computeExamples(schema, mime, opts = {}) {
    const options = { ...opts };
    if (!schema || (!mime && !opts.rawOnly)) {
      return undefined;
    }
    this._resolve(schema);
    const xmlSerialization = this.xmlSerialization(schema);
    const { xmlName, xmlNamespace, xmlPrefix } = this._computeXmlSerializationData(xmlSerialization)
    if (!options.typeName) {
      const typeName = this.computeTypeName(schema, xmlName);
      if (typeName) {
        options.typeName = typeName;
      }
    }
    const eKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.examples);
    const examples = this._ensureArray(schema[eKey]);
    if (examples && examples.length) {
      const properties = this._listProperties(schema);
      if (properties) {
        options.properties = properties;
      }
      const result = this._computeFromExamples(examples, mime, options);
      if (result) {
        return result;
      }
    }
    const jsonSchema = this._readJsonSchema(schema);
    if (jsonSchema) {
      return this._exampleFromJsonSchema(schema, jsonSchema);
    }

    if (options.rawOnly) {
      return undefined;
    }
    if (this._hasType(schema, this.ns.aml.vocabularies.shapes.ArrayShape)) {
      const value = this._computeExampleArrayShape(schema, mime, options);
      if (value) {
        return value;
      }
    }
    if (this._hasType(schema, this.ns.aml.vocabularies.apiContract.Example)) {
      const value = this._generateFromExample(schema, mime, options);
      if (value) {
        return [value];
      }
    }

    if (this._hasType(schema, this.ns.aml.vocabularies.shapes.UnionShape)) {
      return this._computeUnionExamples(schema, mime, options);
    }

    if (this._hasProperty(schema, this.ns.w3.shacl.and)) {
      return this._computeAndExamples(schema, mime, options);
    }

    if (options.noAuto) {
      return undefined;
    }

    if (this._hasType(schema, this.ns.aml.vocabularies.shapes.ScalarShape)) {
      const result = this._computeJsonScalarValue(schema);
      return [
        {
          hasRaw: false,
          hasTitle: false,
          hasUnion: false,
          value: result,
          isScalar: true,
        },
      ];
    }

    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    let properties = this._ensureArray(schema[pKey]);
    if (properties && properties.length) {
      if (!opts.renderReadOnly) {
        properties = this._filterReadOnlyProperties(properties);
      }
      const value = this._exampleFromProperties(
        properties,
        mime,
        options.typeName,
        options.parentName,
        xmlNamespace,
        xmlPrefix
      );
      if (value) {
        return [value];
      }
    }
    return undefined;
  }

  xmlSerialization(schema) {
    const sKey = this._getAmfKey(
      this.ns.aml.vocabularies.shapes.xmlSerialization
    );
    return schema[sKey];
  }

  /**
   * Reads a raw value of JSON schema if available.
   * @param {any} schema Schema shape of a type.
   * @return {string|undefined} JSON schema if exists.
   */
  _readJsonSchema(schema) {
    const sourceKey = this._getAmfKey(
      this.ns.raml.vocabularies.docSourceMaps.sources
    );
    const trackedKey = this._getAmfKey(
      this.ns.raml.vocabularies.docSourceMaps.parsedJsonSchema
    );
    let sm = schema[sourceKey];
    if (!sm) {
      return undefined;
    }
    if (Array.isArray(sm)) {
      sm = sm[0];
    }
    let tracked = sm[trackedKey];
    if (!tracked) {
      return undefined;
    }
    if (Array.isArray(tracked)) {
      tracked = tracked[0];
    }
    return this._getTrackedValue(tracked);
  }

  /**
   * Computes examples value from a list of examples.
   * @param {Array<Object>} examples List of AMF Example shapes.
   * @param {String} mime Examples media type. Currently `application/json` and
   * `application/xml` are supported.
   * @param {Object} opts Generation options. See `generatePayloadsExamples()`.
   * Besides that, `opts.typeId` is required to compute examples for a payload.
   * The `typeId` is a value of `@id` of the Payload shape.
   * @return {Array<Object>|undefined}
   */
  _computeFromExamples(examples, mime, opts) {
    let data = this._processExamples(examples);
    data = this._listTypeExamples(data, opts.typeId);
    if (!data) {
      return undefined;
    }
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const shape = data[i];
      const value = this._generateFromExample(shape, mime, opts);
      if (value) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * In AMF 4 the examples model changes from being an array of examples
   * to an object that contains an array of examples.
   * This function extracts the array of examples back to the `examples` variable,
   * respecting that the compact model can be an object instead of array.
   * If the argument is an array with more than one item it means it's pre-4.0.0
   * model.
   * @param {Array|Object} examples Examples model.
   * @return {Array|undefined} List of examples to process.
   */
  _processExamples(examples) {
    // @TODO: should it be `document.examples` or `apiContract.examples`
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.examples);
    if (!Array.isArray(examples)) {
      if (
        this._hasType(examples, this.ns.aml.vocabularies.document.NamedExamples)
      ) {
        return this._ensureArray(examples[key]);
      }
      return undefined;
    }
    if (
      examples.length === 1 &&
      this._hasType(
        examples[0],
        this.ns.aml.vocabularies.document.NamedExamples
      )
    ) {
      return this._ensureArray(examples[0][key]);
    }
    return examples;
  }

  /**
   * Uses Example shape's source maps to determine which examples should be rendered.
   * @param {Array<Object>} examples List of AMF Example shapes.
   * @param {String} typeId Payload ID
   * @return {Array<Object>|undefined}
   */
  _listTypeExamples(examples, typeId) {
    if (!typeId) {
      return examples;
    }
    const result = [];
    const sourceKey = this._getAmfKey(
      this.ns.raml.vocabularies.docSourceMaps.sources
    );
    const trackedKey = this._getAmfKey(
      this.ns.raml.vocabularies.docSourceMaps.trackedElement
    );
    const longId = typeId.indexOf('amf') === -1 ? 'amf://id' + typeId : typeId;
    for (let i = 0, len = examples.length; i < len; i++) {
      let example = examples[i];
      if (Array.isArray(example)) {
        example = example[0];
      }
      let sm = example[sourceKey];
      if (!sm) {
        result[result.length] = example;
        continue;
      }
      if (Array.isArray(sm)) {
        sm = sm[0];
      }
      let tracked = sm[trackedKey];
      if (!tracked) {
        result[result.length] = example;
        continue;
      }
      if (Array.isArray(tracked)) {
        tracked = tracked[0];
      }
      const value = this._getTrackedValue(tracked);
      if (!value) {
        continue;
      }
      const ids = value.split(',');
      if (ids.indexOf(longId) !== -1 || ids.indexOf(typeId) !== -1) {
        result[result.length] = example;
      }
    }
    return result.length ? result : undefined;
  }

  /**
   * Generate an example from an example shape.
   *
   * @param {Object} example Resolved example.
   * @param {String} mime Example content type.
   * @param {ExampleOptions=} opts Processing options.
   * @return {Example|undefined}
   */
  _generateFromExample(example, mime, opts) {
    let raw = /** @type {string|number|Boolean} */ (this._getValue(
      example,
      this.ns.aml.vocabularies.document.raw
    ));
    if (!raw) {
      raw = /** @type {string} */ (this._getValue(
        example,
        this.ns.w3.shacl.raw
      ));
      const referenceIdKey = this._getAmfKey(this.ns.aml.vocabularies.document.referenceId);
      const referenceIdData = this._ensureArray(example[referenceIdKey]);
      if (Array.isArray(referenceIdData) && referenceIdData.length > 0) {
        raw = (this._getValue(referenceIdData[0], this.ns.aml.vocabularies.document.raw));

        // Map raw to external fragment
        if (!raw) {
          // It first retrieves the @id property from the first element
          // of referenceIdData array and assigns it to referenceId.
          const referenceId = referenceIdData[0]['@id']

          // It calls the _computeReferences method with this.amf as an
          // argument to get the root references and assigns
          // the result to rootReferences.
          const rootReferences = this._computeReferences(this.amf)

          // It maps over each item in rootReferences,
          // and for each item, it computes references twice in a nested manner.
          // It then gets the second element from externalFragments and computes its encodes.
          // The result of this map operation is an array of
          // encoded external fragments, which is assigned to encodesOfExternalFragments.
          const encodesOfExternalFragments = rootReferences.map((item) => {
            const shapeFragment = this._computeReferences(item)
            const externalFragments = this._computeReferences(shapeFragment)
            // Get second element from externalFragments
            const externalFragmentExample = externalFragments[1]
            return this._computeEncodes(externalFragmentExample)
          })

          // It finds an element in encodesOfExternalFragments where
          // the @id property matches referenceId and assigns
          // it to exmapleExternalFragmentByReferenceId.
          const exmapleExternalFragmentByReferenceId = encodesOfExternalFragments.find(externalFrament => (
            externalFrament['@id'] === referenceId
          ))

          const rawKey = this._getAmfKey(this.ns.aml.vocabularies.document.raw)
          // Finally, it calls the _getValue method with
          // exmapleExternalFragmentByReferenceId and rawKey
          // as arguments and assigns the result to raw.
          raw = this._getValue(exmapleExternalFragmentByReferenceId, rawKey)
        }
      }
    }
    let title = /** @type {string} */ (this._getValue(
      example,
      this.ns.aml.vocabularies.core.displayName
    ))
    if (!title) {
      title = /** @type {string} */ (this._getValue(
        example,
        this.ns.aml.vocabularies.core.name
      ));
    }
    if (title && title.indexOf('example_') === 0) {
      title = undefined;
    }
    const description = /** @type {string} */ (this._getValue(
      example,
      this.ns.aml.vocabularies.core.description
    ));
    const hasRaw = !!raw;
    const result = {};
    result.hasTitle = !!title;
    result.hasUnion = false;
    if (description) {
      result.description = description;
    }
    if (result.hasTitle) {
      result.title = title;
    }
    if (opts.rawOnly && !raw) {
      return undefined;
    }
    if (opts.rawOnly) {
      result.hasRaw = false;
      result.value = raw;
      result.isScalar = false;
      return result;
    }
    const isJson = mime.indexOf('json') !== -1;
    const isXml = !isJson && mime.indexOf('xml') !== -1;
    if (hasRaw) {
      if (isJson) {
        try {
          const res = JSON.parse(raw);
          const type = typeof res;
          if (type === 'string' || type === 'number' || type === 'boolean') {
            throw new Error('');
          }
          result.hasRaw = false;
          result.value = raw;
          result.isScalar = false;
          return result;
        } catch (_) {
          // ...
        }
      }
      if (isXml) {
        if (raw.trim()[0] === '<') {
          result.hasRaw = false;
          result.value = raw;
          result.isScalar = false;
          return result;
        }
      }
      result.hasRaw = true;
      result.raw = raw;
    }
    const sKey = this._getAmfKey(
      this.ns.aml.vocabularies.document.structuredValue
    );
    let structure = example[sKey];
    if (!structure) {
      if (result.raw) {
        result.value = result.raw;
      } else {
        result.value = '';
      }
      result.isScalar = false;
      return result;
    }
    if (Array.isArray(structure)) {
      structure = structure[0];
    }
    if (this._hasType(structure, this.ns.aml.vocabularies.data.Scalar)) {
      const value = this._getTypedValue(structure);
      result.value = value;
      result.isScalar = true;
      return result;
    }

    result.isScalar = false;

    if (this._hasType(structure, this.ns.aml.vocabularies.data.Array)) {
      const membersKey = this._getAmfKey(this.ns.w3.rdfSchema.member);
      const members = this._ensureArray(structure[membersKey]);
      if (!members) {
        result.value = this._appendXmlHeader('');
        return result;
      }
      const parts = [];
      members.forEach((member) => {
        let data;
        if (isJson) {
          data = this._jsonFromStructure(member);

        } else if (isXml) {
          data = this._xmlFromStructure(member, { ...opts, ignoreXmlHeader: true });
        }
        if (data) {
          parts.push(data);
        }
      });
      if (isJson) {
        // if raw (original example) exists try to parse it to JSON
        // if the parse process fails then use parts to build example value
        if (result.raw) {
          try {
            result.value = this.computeRaw(raw)
            return result
          } catch (_) {
            // ...
          }
        }

        result.value = JSON.stringify(parts, null, 2);
        return result;
      }
      if (isXml) {
        result.value = parts.join('\n');
        return result;
      }
      result.value = '';
      return result;
    }

    if (isJson) {
      let data = this._jsonFromStructure(structure);
      if (data) {
        if (typeof data === 'object') {
          data = JSON.stringify(data, null, 2);
        }
        result.value = data;
        return result;
      }
    } else if (isXml) {
      const data = this._xmlFromStructure(structure, opts);
      result.value = data;
      return result;
    } else {
      if (result.raw) {
        result.value = result.raw;
      } else {
        result.value = '';
      }
      return result;
    }
    return undefined;
  }

  parseToJSON (arr) {
    return arr
      .filter(item => item.trim() !== "") // Remove empty strings
      .map(item => {
        if (item.startsWith("- ")) {
          // Handle case where item is a list of numbers
          return item.split("- ")
            .filter(subItem => subItem.trim() !== "")
            .map(subItem => Number(subItem.trim()));
        }
        // Handle case where item is a key-value pair
        const entries = item.trim().split("\n").map(line => {
          const index = line.indexOf(":");
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim();
          if (value.startsWith("\"") && value.endsWith("\"")) {
            return [key, value.slice(1, -1)]; // Preserve leading zeros
          }
          if (!Number.isNaN(Number(value))) {
            return [key, Number(value)];
          }
          return [key, value];
        });
        return Object.fromEntries(entries);

      });
};

  /**
   * @param {String} raw
   * @returns string JSON formatted
   */
  computeRaw(raw) {
    const accountEntries = raw.split('-\n');
    const parsed = this.parseToJSON(accountEntries)
     // Ensure the parsed result is always an array
     const result = Array.isArray(parsed[0]) ? parsed.flat() : parsed;
    return JSON.stringify(result, null, 2);
  }


  /**
   * Computes list of examples for an array shape.
   * @param {Object} schema The AMF's array shape
   * @param {String} mime Current mime type
   * @param {ExampleOptions} [opts={}]
   * @return {Array<Example>|undefined}
   */
  _computeExampleArrayShape(schema, mime, opts = {}) {
    const options = { ...opts };
    const iKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.items);
    const items = this._ensureArray(schema[iKey]);
    if (!items) {
      return undefined;
    }
    const isJson = mime.indexOf('json') !== -1;
    options.parentName = options.typeName;
    delete options.typeName;
    // We need only first type here as arras can have different types
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const result = this.computeExamples(item, mime, options);
      if (result) {
        if (isJson) {
          processJsonArrayExamples(result);
        }
        return result;
      }
    }
    return undefined;
  }

  /**
   * Computes example for an `and` shape.
   * @param {Object} schema The AMF's array shape
   * @param {String} mime Current mime type
   * @param {ExampleOptions=} [opts={}]
   * @return {Array<Example>|undefined}
   */
  _computeAndExamples(schema, mime, opts) {
    const andKey = this._getAmfKey(this.ns.w3.shacl.and);
    const and = this._ensureArray(schema[andKey]);
    if (!and) {
      return undefined;
    }
    const mergedSchema = this._mergeSchemaWithProperties(schema, and);
    // Remove the shacl:and property to avoid infinite recursion
    delete mergedSchema[andKey];
    return this.computeExamples(mergedSchema, mime, opts);
  }

  /**
   * Merges a schema's properties with all the properties in a list of shapes
   * Returns a new object to avoid changing the original schema object
   * @param {Object} schema AMF schema object
   * @param {Array<Object>} shapes List of shapes whose properties we want to merge
   * @private
   */
  _mergeSchemaWithProperties(schema, shapes) {
    const newSchema = { ...schema };
    const propertyKey = this._getAmfKey(this.ns.w3.shacl.property);
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      this._resolve(shape);
      if (!shape[propertyKey] && !newSchema[propertyKey]) {
        continue;
      }
      const properties = shape[propertyKey] || [];
      const currentProps = newSchema[propertyKey] || [];
      newSchema[propertyKey] = [...currentProps, ...properties];
    }
    return newSchema;
  }

  /**
   * Computes example for an union shape.
   * @param {Object} schema The AMF's array shape
   * @param {String} mime Current mime type
   * @param {ExampleOptions} [opts={}]
   * @return {Array<Example>|undefined}
   */
  _computeUnionExamples(schema, mime, opts) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
    const anyOf = this._ensureArray(schema[key]);
    if (!anyOf) {
      return undefined;
    }
    const result = {
      hasTitle: false,
      hasRaw: false,
      hasUnion: true,
      isScalar: false,
      values: [],
    };
    for (let i = 0, len = anyOf.length; i < len; i++) {
      let unionShape = anyOf[i];
      if (unionShape instanceof Array) {
        unionShape = unionShape[0];
      }
      this._resolve(unionShape);
      const dataList = this.computeExamples(unionShape, mime, opts);
      if (!dataList) {
        continue;
      }
      const data = dataList[0];
      let name = this._getValue(unionShape, this.ns.w3.shacl.name);
      if (!name) {
        name = 'Union #' + (i + 1);
      }
      data.hasTitle = true;
      data.title = name;
      result.values[result.values.length] = data;
    }
    return result.values.length ? [result] : undefined;
  }

  /**
   * Computes value from defined `datatype` property.
   * @param {Object} shape A shape with `datatype` property.
   * @return {string|undefined} Value of the data type.
   */
  _computeScalarType(shape) {
    const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
    let dt = shape[dtKey];
    if (!dt) {
      return undefined;
    }
    if (Array.isArray(dt)) {
      dt = dt[0];
    }
    let id = dt['@id'] ? dt['@id'] : dt;
    const w3index = id.indexOf(this.ns.w3.xmlSchema + '');
    if (w3index !== -1) {
      id = id.substr((this.ns.w3.xmlSchema + '').length);
    }
    const shapeIndex = id.indexOf(this.ns.aml.vocabularies.shapes + '');
    if (shapeIndex !== -1) {
      id = id.substr((this.ns.aml.vocabularies.shapes + '').length);
    }
    const index = id.indexOf(':');
    if (index !== -1) {
      id = id.substr(index + 1);
    }
    return id[0].toUpperCase() + id.substr(1);
  }

  /**
   * Creates a JSON example representation from AMF example's structure
   * definition.
   * @param {Object} structure
   * @return {any|undefined}
   */
  _jsonFromStructure(structure) {
    if (!structure) {
      return undefined;
    }
    if (this._hasType(structure, this.ns.aml.vocabularies.data.Scalar)) {
      return this._getTypedValue(structure);
    }
    let obj;
    let isArray = false;
    if (this._hasType(structure, this.ns.aml.vocabularies.data.Object)) {
      obj = {};
    } else if (this._hasType(structure, this.ns.aml.vocabularies.data.Array)) {
      obj = [];
      isArray = true;
    } else {
      return undefined;
    }
    if (isArray && this._hasProperty(structure, this.ns.w3.rdfSchema.member)) {
      const key = this._getAmfKey(this.ns.w3.rdfSchema.member);
      const items = this._ensureArray(structure[key]);
      for (let i = 0, len = items.length; i < len; i++) {
        const item = items[i];
        this._jsonFromStructureValue(item, obj, isArray);
      }
    } else {
      const resolvedPrefix = this._getAmfKey(
        this.ns.aml.vocabularies.data.toString()
      );
      Object.keys(structure).forEach(key => {
        if (key.indexOf(resolvedPrefix) !== 0) {
          return;
        }
        const v = structure[key];
        this._jsonFromStructureValue(v, obj, isArray, key, resolvedPrefix);
      });
    }
    return obj;
  }

  /**
   * Creates a JSON object structure from an example.
   * This object is later on serialized to the example string value.
   *
   * @param {Object|Array<any>|number|string} value Value to process
   * @param {Object|Array<any>} obj The target object
   * @param {Boolean} isArray When set the `obj` is an array.
   * @param {String=} key Processed object's key
   * @param {String=} resolvedPrefix AMF's `data:` prefix
   */
  _jsonFromStructureValue(value, obj, isArray, key, resolvedPrefix) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    const tmp = this._jsonFromStructure(value);
    if (tmp === undefined) {
      // it can be false or null
      return;
    }
    if (isArray) {
      obj[obj.length] = tmp;
    } else {
      key = key.replace(resolvedPrefix, '');
      if (key[0] === ':') {
        key = key.substr(1);
      }
      try {
        key = decodeURIComponent(key);
      } catch (_) {
        // ...
      }
      obj[key] = tmp;
    }
  }

  /**
   * Generates XML example string value from AMF's structured value definition.
   * @param {Object} serialization Value of the `serialization` property of AMF's object.
   * @return {XmlData}
   */
  _computeXmlSerializationData(serialization) {
    if (!serialization) {
      return {};
    }
    if (Array.isArray(serialization)) {
      serialization = serialization[0];
    }
    const { shapes } = this.ns.aml.vocabularies;
    const isWrapped = /** @type boolean */ (this._getValue(serialization, shapes.xmlWrapped));
    const xmlName = /** @type string */ (this._getValue(serialization, shapes.xmlName));
    const xmlAttribute = /** @type boolean */ (this._getValue(serialization, shapes.xmlAttribute));
    const xmlNamespace = /** @type string */ (this._getValue(serialization, shapes.xmlNamespace));
    const xmlPrefix = /** @type string */ (this._getValue(serialization, shapes.xmlPrefix));
    return { isWrapped, xmlName, xmlAttribute, xmlNamespace, xmlPrefix };
  }

  /**
   * Generates XML example string value from AMF's structured value definition.
   * @param {any} property AMF property
   * @param {string} name Current property name
   * @param {any[]} properties Value of the `property` property of AMF's object.
   * @return {XmlData}
   */
  _computeXmlData(property, name, properties) {
    const { data, shapes } = this.ns.aml.vocabularies;
    const arrayProperty = this._hasType(property, data.Array);
    if (!arrayProperty) {
      return {};
    }

    let propertySchema;
    if (properties) {
      propertySchema = properties.find(p => this._getValue(p, this.ns.w3.shacl.name) === name);
    }
    if (!propertySchema) {
      return {};
    }

    const rKey = this._getAmfKey(shapes.range);
    let range = propertySchema[rKey];
    if (!range) {
      return {};
    }

    if (Array.isArray(range)) {
      range = range[0];
    }
    const serialization = this.xmlSerialization(range);
    return this._computeXmlSerializationData(serialization);
  }

  /**
   * Generates XML example string value from AMF's structured value definition.
   * @param {Object} structure Value of the `structuredValue` property of AMF's example object.
   * @param {ExampleOptions=} opts Examples processing options
   * @return {String}
   */
  _xmlFromStructure(structure, opts = {}) {
    let typeName = (opts && opts.typeName) || UNKNOWN_TYPE;
    typeName = normalizeXmlTagName(typeName);
    const doc = document.implementation.createDocument('', typeName, null);
    const main = doc.documentElement;
    const keys = Object.keys(structure);
    const dataPrefix = this._getAmfKey(
      this.ns.aml.vocabularies.data.toString()
    );
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (key.indexOf(dataPrefix) !== 0) {
        continue;
      }
      let item = structure[key];
      if (item instanceof Array) {
        item = item[0];
      }
      const name = dataNameFromKey(key);
      const { isWrapped, xmlName } = this._computeXmlData(
        item,
        name,
        opts.properties
      );
      this._xmlProcessDataProperty(doc, main, item, xmlName || name, { isWrapped });
    }
    const s = new XMLSerializer();
    let value = s.serializeToString(doc);
    if (!opts.ignoreXmlHeader) {
      value = this._appendXmlHeader(value);
    }
    return formatXml(value);
  }

  /**
   * Adds XML schema header.
   * @param {string} value
   * @returns {string}
   */
  _appendXmlHeader(value) {
    return `<?xml version="1.0" encoding="UTF-8"?>${value}`;
  }

  /**
   * Reads the value of the `structuredValue` and casts it to the corresponding type.
   * @param {Object} structure Value of the `structuredValue` property of AMF's example object.
   * @return {string|number|boolean|null} Value casted to a type
   */
  _getTypedValue(structure) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.data.value);
    let shape = structure[key];
    if (shape === null || shape === undefined) {
      return undefined;
    }
    if (Array.isArray(shape)) {
      shape = shape[0];
    }
    const value = typeof shape === 'object' ? shape['@value'] : shape;
    if (!value) {
      return value;
    }
    let dt = shape['@type'];
    if (!dt) {
      const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
      dt = this._ensureArray(structure[dtKey]);
      if (dt) {
        dt = dt[0]['@id'];
      }
    }
    if (!dt) {
      return value || '';
    }
    if (dt instanceof Array) {
      dt = dt[0];
    }
    return this._typeToValue(value, dt);
  }

  /**
   * Creates a example structure for the JSON schema.
   * Old but still in use.
   * @param {Object} schema AMF schema shape
   * @param {String} jsonSchema Raw JSON schema value
   * @return {Array<Example>} Generated example model.
   */
  _exampleFromJsonSchema(schema, jsonSchema) {
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    const properties = this._ensureArray(schema[pKey]);
    let example;
    if (properties && properties.length) {
      const typeName =
        /** @type string */ (this._getValue(schema, this.ns.w3.shacl.name)) ||
        UNKNOWN_TYPE;
      example = this._exampleFromProperties(
        properties,
        'application/json',
        typeName
      );
    }
    if (example) {
      example.hasRaw = true;
      example.raw = jsonSchema;
    } else {
      example = {
        hasRaw: false,
        hasTitle: false,
        hasUnion: false,
        isScalar: false,
        value: jsonSchema,
      };
    }
    return [example];
  }

  /**
   * Creates an example from RAML type properties.
   * @param {Array<Object>} properties List of AMF type properties to process.
   * @param {string} mime Media type
   * @param {string=} typeName Name of the RAML type.
   * @param {string=} parentType For XML processing, parent type name in case of Array type.
   * @param {string=} namespace For XML processing, parent type name in case of Array type.
   * @param {string=} prefix For XML processing, parent type name in case of Array type.
   * @return {Example|undefined}
   */
  _exampleFromProperties(properties, mime, typeName, parentType, namespace, prefix) {
    const name = typeName || UNKNOWN_TYPE;
    let result;
    if (mime.indexOf('json') !== -1) {
      const value = this._jsonExampleFromProperties(properties);
      if (value) {
        result = JSON.stringify(value, null, 2);
      }
    } else if (mime.indexOf('xml') !== -1) {
      result = this._xmlExampleFromProperties(properties, name, parentType, namespace, prefix);
      if (result) {
        result = `<?xml version="1.0" encoding="UTF-8"?>${result}`;
        result = formatXml(result);
      }
    }
    if (result) {
      return {
        hasRaw: false,
        hasTitle: false,
        hasUnion: false,
        isScalar: false,
        value: result,
      };
    }
    return undefined;
  }

  /**
   * Generates a JSON example from RAML's type properties.
   * @param {Array<Object>} properties List of type properties
   * @return {Object|undefined}
   */
  _jsonExampleFromProperties(properties) {
    const result = {};
    for (let i = 0, len = properties.length; i < len; i++) {
      const property = properties[i];
      const name = this._getValue(property, this.ns.w3.shacl.name);
      if (!name) {
        continue;
      }
      const rKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.range);
      let range = property[rKey];
      if (!range) {
        continue;
      }
      if (range instanceof Array) {
        range = range[0];
      }
      const eKey = this._getAmfKey(
        this.ns.aml.vocabularies.apiContract.examples
      );
      const examples = this._ensureArray(range[eKey]);
      if (examples && examples.length) {
        const sKey = this._getAmfKey(
          this.ns.aml.vocabularies.document.structuredValue
        );
        examples.forEach(example => {
          let structure = example[sKey];
          if (!structure) {
            result[name] = '';
            return;
          }
          if (structure instanceof Array) {
            structure = structure[0];
          }
          const data = this._jsonFromStructure(structure);
          if (data !== undefined) {
            result[name] = data;
          }
        });
      } else {
        const aKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
        let value
        const anyOf = this._ensureArray(range[aKey]);
        if (anyOf) {
          for (let anyOfIndex = 0; anyOfIndex < anyOf.length; anyOfIndex++) {
            const exampleValue = this._computeJsonPropertyValue(anyOf[anyOfIndex]);
            if (exampleValue !== null) {
              value = exampleValue;
              break;
            }
          }
        } else {
          value = this._computeJsonPropertyValue(range);
        }
        if (value === undefined) {
          value = '';
        }
        result[name] = value;
      }
    }
    return result;
  }

  /**
   * Computes JSON value from a range shape.
   * @param {Object} range AMF's range model.
   * @param {string=} typeName Optional, type name to use in Union type. By default first NodeShape.
   * @return {string|number|boolean|null|Array<any>|object|undefined}
   */
  _computeJsonPropertyValue(range, typeName) {
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.ScalarShape)) {
      return this._computeJsonScalarValue(range);
    }
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.UnionShape)) {
      return this._computeJsonUnionValue(range, typeName);
    }
    if (this._hasProperty(range, this.ns.w3.shacl.and)) {
      return this._computeJsonAndValue(range, typeName);
    }
    if (this._hasType(range, this.ns.w3.shacl.NodeShape)) {
      return this._computeJsonObjectValue(range);
    }
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.ArrayShape)) {
      return this._computeJsonArrayValue(range);
    }
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.NilShape)) {
      return null;
    }
    if (this._hasProperty(range, this.ns.w3.shacl.xone)) {
      const xKey = this._getAmfKey(this.ns.w3.shacl.xone);
      const oneOfOptions = range[xKey]
      if (Array.isArray(oneOfOptions) && oneOfOptions.length > 0) {
        return this._computeJsonPropertyValue(oneOfOptions[0], typeName);
      }
    }
    return undefined;
  }

  /**
   * Computes scalar value for AMF's range and casts it to the corresponding type.
   * When the value is not defined then it creates a default value.
   * This is for the mocking service to work with generated example.
   *
   * @param {Object} range AMF's range definition for a shape.
   * @return {string|number|boolean|null} Value casted to the corresponding type
   */
  _computeJsonScalarValue(range) {
    const value = this._getTypeScalarValue(range);
    if (!value) {
      return this._computeDefaultRangeValue(range);
    }
    const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
    let dt = range[dtKey];
    if (!dt) {
      return value || '';
    }
    if (dt instanceof Array) {
      dt = dt[0];
    }
    return this._typeToValue(value, dt['@id']);
  }

  /**
   * Computes default enum value for given range.
   *
   * @param {Object} range AMF's range definition for a shape.
   * @return {string|number|boolean|null} Value cast to the corresponding type
   */
  _computeDefaultEnumRangeValue(range) {
    let enumOptions = range[this._getAmfKey(this.ns.w3.shacl.in)]
    if (Array.isArray(enumOptions)) {
      [enumOptions] = enumOptions;
    }
    const rdfKey = this._getAmfKey(this.ns.w3.rdfSchema.key);
    const firstOptionKey = Object.keys(enumOptions).find((key) => key.indexOf(rdfKey) !== -1);
    let firstOption = enumOptions[firstOptionKey];
    if (Array.isArray(firstOption)) {
      [firstOption] = firstOption;
    }
    const vKey = this._getAmfKey(this.ns.raml.vocabularies.data.value);
    const value = this._getValue(firstOption, vKey);
    if (value) {
      return value;
    }
    return null;
  }

  /**
   * Computes default value for given range.
   *
   * This is to work with mocking services when the user just want to send an
   * example value to the server. This ensures valid input from the client
   * even of this alters the `default` value for the API (when one does not
   * exist)
   *
   * @param {Object} range AMF's range definition for a shape.
   * @return {string|number|boolean|null} Value casted to the corresponding type
   */
  _computeDefaultRangeValue(range) {
    const isEnum = this._hasProperty(range, this.ns.w3.shacl.in)
    if (isEnum) {
      const value = this._computeDefaultEnumRangeValue(range);
      if (value) {
        return value;
      }
    }

    const type = this._computeScalarType(range);
    switch (type) {
      case 'Number':
      case 'Integer':
      case 'Long':
      case 'Float':
      case 'Double':
        return 0;
      case 'Boolean':
        return false;
      case 'Nil':
      case 'Null':
        return null;
      default:
        return '';
    }
  }

  /**
   * Casts the value to given data type represented in AMF notation.
   * @param {string} value Value encoded in AMF
   * @param {string} type AMF data type
   * @return {String|Number|Boolean|Null} Casted value.
   */
  _typeToValue(value, type) {
    switch (type) {
      case this._getAmfKey(this.ns.w3.xmlSchema.boolean):
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.boolean):
      case this.ns.w3.xmlSchema.boolean:
      case this.ns.aml.vocabularies.shapes.boolean:
        if (value !== undefined) {
          return value === 'true';
        }
        return value;

      case this._getAmfKey(this.ns.w3.xmlSchema.nil):
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.nil):
      case this.ns.w3.xmlSchema.nil:
      case this.ns.aml.vocabularies.shapes.nil:
        return null;
      case this._getAmfKey(this.ns.w3.xmlSchema.integer):
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.integer):
      case this.ns.w3.xmlSchema.integer:
      case this.ns.aml.vocabularies.shapes.integer:
      case this.ns.w3.xmlSchema.number:
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.number):
      case this.ns.aml.vocabularies.shapes.number:
      case this._getAmfKey(this.ns.w3.xmlSchema.long):
      case this.ns.w3.xmlSchema.long:
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.long):
      case this.ns.aml.vocabularies.shapes.long:
      case this._getAmfKey(this.ns.w3.xmlSchema.double):
      case this.ns.w3.xmlSchema.double:
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.double):
      case this.ns.aml.vocabularies.shapes.double:
      case this._getAmfKey(this.ns.w3.xmlSchema.float):
      case this.ns.w3.xmlSchema.float:
      case this._getAmfKey(this.ns.aml.vocabularies.shapes.float):
      case this.ns.aml.vocabularies.shapes.float:
        if (value) {
          const nValue = Number(value);
          if (Number.isNaN(nValue)) {
            return 0;
          }
          return Number(value);
        }
        return 0;
      default:
        return value || '';
    }
  }

  /**
   * Computes JSON example from UnionShape
   * @param {Object} range Type definition
   * @param {String=} typeName Optional, type name to use. By default first NodeShape.
   * @return {Object|undefined}
   */
  _computeJsonUnionValue(range, typeName) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
    const list = this._ensureArray(range[key]);
    if (!list) {
      return undefined;
    }
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    for (let i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      if (Array.isArray(item)) {
        item = item[0];
      }
      this._resolve(item);
      if (typeName) {
        const name = this._getValue(item, this.ns.w3.shacl.name);
        if (typeName !== name) {
          continue;
        }
      }
      if (this._hasType(item, this.ns.w3.shacl.NodeShape)) {
        item = this._resolve(item);
        const data = this._ensureArray(item[pKey]);
        if (data) {
          return this._jsonExampleFromProperties(data);
        }
      }
      if (this._hasType(item, this.ns.aml.vocabularies.shapes.ScalarShape)) {
        return this._computeJsonScalarValue(item);
      }
    }
    return undefined;
  }

  _computeJsonAndValue(range, typeName) {
    const key = this._getAmfKey(this.ns.w3.shacl.and);
    const list = this._ensureArray(range[key]);
    if (!list) {
      return undefined;
    }
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    const examples = [];
    for (let i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      if (Array.isArray(item)) {
        item = item[0];
      }
      this._resolve(item);
      if (typeName) {
        const name = this._getValue(item, this.ns.w3.shacl.name);
        if (typeName !== name) {
          continue;
        }
      }
      if (this._hasType(item, this.ns.w3.shacl.NodeShape)) {
        item = this._resolve(item);
        const data = this._ensureArray(item[pKey]);
        if (data) {
          const example = this._jsonExampleFromProperties(data);
          if (example && typeof example === 'object') {
            examples.push(example);
          }
        }
      }
    }
    const properties = this._ensureArray(range[pKey])
    if (properties) {
      const propertiesExamples = this._jsonExampleFromProperties(properties)
      if (propertiesExamples && typeof propertiesExamples === 'object') {
        examples.push(propertiesExamples);
      }
    }
    return examples.reduce((acc, value) => ({ ...acc, ...value }), {});
  }

  /**
   * Computes JSON object as an example from a range that is an object.
   *
   * @param {Object} range AMF's range definition for a shape.
   * @return {any|undefined} A JavaScript object computed from the properties.
   */
  _computeJsonObjectValue(range) {
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    const properties = this._ensureArray(range[pKey]);

    const additionalPropertiesKey = this._getAmfKey(this.ns.w3.shacl.additionalPropertiesSchema);
    const additionalProperties = this._ensureArray(range[additionalPropertiesKey]);

    if (properties && properties.length) {
      return this._jsonExampleFromProperties(properties);
    }
    if (additionalProperties && additionalProperties.length) {
      return this._jsonExampleFromProperties(this._ensureArray(additionalProperties[0][pKey]));
    }

    return {};
  }

  /**
   * Computes JSON object as an example from a range that is an array.
   *
   * @param {Object} range AMF's range definition for a shape.
   * @return {Array<Object>|undefined} A JavaScript array computed from the items.
   */
  _computeJsonArrayValue(range) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.items);
    const items = this._ensureArray(range[key]);
    if (!items) {
      return undefined;
    }
    const result = [];
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      if (item instanceof Array) {
        item = item[0];
      }
      this._resolve(item);
      const value = this._computeJsonPropertyValue(item);
      if (value !== undefined) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * Reads raw value of the example.
   * @param {Array<Object>|Object} example AMF's example definition.
   * @return {String|undefined} Raw example value.
   */
  _extractExampleRawValue(example) {
    let data = example;
    if (Array.isArray(data)) {
      data = data[0];
    }
    if (this._hasType(data, this.ns.aml.vocabularies.document.NamedExamples)) {
      const key = this._getAmfKey(
        this.ns.aml.vocabularies.apiContract.examples
      );
      data = data[key];
      if (Array.isArray(data)) {
        data = data[0];
      }
    }
    return /** @type string */ (this._getValue(
      data,
      this.ns.aml.vocabularies.document.raw
    ));
  }

  /**
   * Reads a value from a Range shape for a scalar value.
   *
   * @param {Object} range AMF's range model.
   * @return {string|undefined}
   */
  _getTypeScalarValue(range) {
    const dvKey = this._getAmfKey(this.ns.w3.shacl.defaultValue);
    let dv = range[dvKey];
    if (dv) {
      if (dv instanceof Array) {
        dv = dv[0];
      }
      return /** @type string */ (this._getValue(
        dv,
        this.ns.aml.vocabularies.data.value
      ));
    }
    const rKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.examples);
    const ex = range[rKey];
    if (ex) {
      return this._extractExampleRawValue(ex);
    }
    return undefined;
  }

  _nameTagWithPrefix(name, prefix) {
    let type = normalizeXmlTagName(name);
    if (prefix) {
      type = `${prefix}:${type}`
    }
    return type
  }

  /**
   * Computes example from a range's properties for XML media type.
   *
   * @param {Array<Object>} properties Properties read from the range object that represents an object
   * @param {String=} typeName Object name in API specification
   * @param {String=} parentType When the XML is an array then the type is the parent type
   * @param {String=} xmlNamespace XML namespace
   * @param {String=} xmlPrefix XML prefix
   * @return {String}
   */
  _xmlExampleFromProperties(properties, typeName, parentType, xmlNamespace, xmlPrefix) {
    const type = this._nameTagWithPrefix(typeName, xmlPrefix)
    let parent = parentType;
    if (parent) {
      parent = normalizeXmlTagName(parent);
    }
    const doc = document.implementation.createDocument(
      xmlNamespace,
      parent || type,
      null
    );
    let main = doc.documentElement;
    if (parent) {
      const element = doc.createElement(type);
      main.appendChild(element);
      main = element;
    }
    for (let i = 0, len = properties.length; i < len; i++) {
      this._xmlProcessProperty(doc, main, properties[i]);
    }
    const s = new XMLSerializer();
    return s.serializeToString(doc);
  }

  /**
   * Processes an XML property
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} property AMF property
   */
  _xmlProcessProperty(doc, node, property) {
    if (!property) {
      return;
    }
    if (this._hasType(property, this.ns.w3.shacl.NodeShape)) {
      const pKey = this._getAmfKey(this.ns.w3.shacl.property);
      const properties = this._ensureArray(property[pKey]);
      if (!properties) {
        return;
      }
      for (let i = 0, len = properties.length; i < len; i++) {
        this._xmlProcessProperty(doc, node, properties[i]);
      }
      return;
    }
    const rKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.range);
    let range = property[rKey];
    if (!range) {
      return;
    }
    if (range instanceof Array) {
      range = range[0];
    }
    const serialization = this.xmlSerialization(range);

    const {
      isWrapped = false,
      xmlAttribute,
      xmlName,
      xmlPrefix
    } = this._computeXmlSerializationData(serialization);
    const eKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.examples);
    const examples = this._ensureArray(range[eKey]);
    if (examples && examples.length) {
      let name = xmlName;
      if (!xmlName) {
        name = /** @type {string} */ (this._getValue(
          range,
          this.ns.w3.shacl.name
        ));
      }
      if (serialization) {
        if (xmlAttribute) {

          this._appendXmlAttribute(node, range, xmlName, examples[0]);
          return;
        }
      }
      this._xmlFromExamples(doc, node, examples[0], name, { xmlPrefix });
      return;
    }
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.UnionShape)) {
      const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.anyOf);
      const list = this._ensureArray(range[key]);
      if (!list) {
        return;
      }
      const shape = list[0];
      if (this._hasType(shape, this.ns.aml.vocabularies.shapes.ScalarShape)) {
        this._xmlProcessUnionScalarProperty(doc, property, shape);
      } else {
        this._xmlProcessProperty(doc, node, shape);
      }
      return;
    }
    if (serialization) {
      if (xmlAttribute) {
        this._appendXmlAttribute(node, range, xmlName);
        return;
      }
    }
    if (this._hasType(range, this.ns.w3.shacl.NodeShape)) {
      this._appendXmlElements(doc, node, range);
      return;
    }
    if (this._hasType(range, this.ns.aml.vocabularies.shapes.ArrayShape)) {
      this._appendXmlArray(doc, node, range, { isWrapped, xmlName, xmlPrefix });
      return;
    }
    this._appendXmlElement(doc, node, range);
  }

  /**
   * Appends XML example data to a node from an example defined on a "range"
   * property. This way it does not generate example values from type values
   * but uses object's example.
   *
   * @param {Document} doc XML document
   * @param {Element} node A node to which append values
   * @param {Object} example AMF's example definition.
   * @param {String} propertyName Name of the property being processed
   * @param {XmlData=} xmlData XMLData
   */
  _xmlFromExamples(doc, node, example, propertyName, xmlData) {
    const sKey = this._getAmfKey(
      this.ns.aml.vocabularies.document.structuredValue
    );
    let structure = example[sKey];
    if (structure instanceof Array) {
      structure = structure[0];
    }
    if (!structure) {
      return;
    }
    this._xmlProcessDataProperty(doc, node, structure, propertyName, xmlData);
  }

  /**
   * Reads property data type.
   * @param {Object} shape
   * @return {string|null} Data type
   */
  _readDataType(shape) {
    const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
    let dataType = shape[dtKey];
    if (!dataType) {
      return null;
    }
    if (dataType instanceof Array) {
      dataType = dataType[0];
    }
    dataType = dataType['@id'];
    return dataNameFromKey(dataType);
  }

  /**
   * Appends an attribute to the node from AMF property
   * @param {Element} node Current node
   * @param {Object} range AMF range
   * @param {String} xmlName Value of 'xmlName' property of AMF's object
   */
  _appendXmlAttribute(node, range, xmlName, example) {
    let name = /** @type {string} */ xmlName;
    if (!name) {
      name = /** @type {string} */ (this._getValue(
        range,
        this.ns.w3.shacl.name
      ));
    }
    if (!name) {
      return;
    }
    if (name.indexOf('?') !== -1) {
      name = name.replace('?', '');
    }
    let exampleValue;
    if (example) {
      const sKey = this._getAmfKey(
        this.ns.aml.vocabularies.document.structuredValue
      );
      const structure = example[sKey];
      exampleValue = this._computeStructuredExampleValue(structure[0]);
    }
    if (exampleValue) {
      node.setAttribute(name, String(exampleValue));
    } else {
      let value = this._readDataType(range);
      if (!value) {
        value = '';
      }
      node.setAttribute(name, value);
    }
  }

  /**
   * Appends an element to the node tree from a type
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} range AMF range
   * @param {XmlData} xmlData XmlData
   * @return {Element|null} Newly created element
   */
  _appendXmlElement(doc, node, range, xmlData = {}) {
    let name = xmlData.xmlName || this._getXmlNormalizedName(range);
    if (!name) {
      return null;
    }
    if (xmlData.xmlPrefix) {
      name = xmlData.xmlPrefix + ':' + name
    }
    let nodeValue = this._getValue(range, this.ns.w3.shacl.defaultValueStr);
    if (!nodeValue) {
      const eKey = this._getAmfKey(
        this.ns.aml.vocabularies.apiContract.examples
      );
      const example = range[eKey];
      if (example) {
        nodeValue = this._extractExampleRawValue(example);
      }
    }
    if (!nodeValue) {
      nodeValue = ' ';
      // Do not add default type name as users do not like this.
      // Mocking service would mark is as an error.
      // this._readDataType(range);
    }
    const element = doc.createElement(name);
    if (nodeValue) {
      const vn = doc.createTextNode(String(nodeValue));
      element.appendChild(vn);
    }
    node.appendChild(element);
    return element;
  }

  /**
   * Appends a list of elements to the node tree from a type
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} range AMF range
   */
  _appendXmlElements(doc, node, range) {
    const pKey = this._getAmfKey(this.ns.w3.shacl.property);
    const properties = this._ensureArray(range[pKey]);
    const element = this._appendXmlElement(doc, node, range);
    if (!properties) {
      return;
    }
    for (let i = 0, len = properties.length; i < len; i++) {
      this._xmlProcessProperty(doc, element, properties[i]);
    }
  }

  /**
   * Reads `w3.shacl.name` from passed object and normalizes it as XML element name.
   * @param {Object} property A property to read the name from. Usually range.
   * @return {String|null} Normalized name or undefined if name is not defined.
   */
  _getXmlNormalizedName(property) {
    const name = /** @type string */ (this._getValue(
      property,
      this.ns.w3.shacl.name
    ));
    if (name) {
      return normalizeXmlTagName(name);
    }
    return null;
  }

  /**
   * Adds elements to the node which are an array.
   *
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} range AMF range
   * @param {XmlData} xmlData XMLData
   */
  _appendXmlArray(doc, node, range, xmlData) {
    let processNode = node;
    const element = this._appendXmlElement(doc, processNode, range, xmlData);
    processNode.appendChild(element);
    processNode = element;

    const pKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.items);
    const properties = this._ensureArray(range[pKey]);
    if (!properties) {
      return;
    }
    for (let i = 0, len = properties.length; i < len; i++) {
      const prop = properties[i];
      if (xmlData.isWrapped) {
        const name = xmlData.xmlName || this._getXmlNormalizedName(prop);
        if (!name) {
          continue;
        }
        const propElement = doc.createElement(name);
        processNode.appendChild(propElement);
        processNode = propElement;
      }
      this._xmlProcessProperty(doc, processNode, properties[i]);
    }
  }

  /**
   * Processes scalar property that is an union in an XML example.
   * @param {Document} doc Main document
   * @param {Object} property A property to process
   * @param {Object} shape AMF shape of a property in the union
   */
  _xmlProcessUnionScalarProperty(doc, property, shape) {
    const name = this._getXmlNormalizedName(property) || 'unknown';
    const type = this._readDataType(shape);
    const element = doc.createElement(name);
    element.appendChild(doc.createTextNode(type));
  }

  /**
   * Processes XML property from a data shape.
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} property AMF property
   * @param {string} name Current property name
   * @param {XmlData=} xmlData XMLData
   */
  _xmlProcessDataProperty(doc, node, property, name, xmlData = {}) {
    const isWrapped = xmlData.isWrapped || false;
    if (!property || !name) {
      return;
    }
    const tagName = this._nameTagWithPrefix(name, xmlData.xmlPrefix);
    const arrayProperty = this._hasType(
      property,
      this.ns.aml.vocabularies.data.Array
    );

    let element;
    if (!arrayProperty || isWrapped) {
      element = doc.createElement(tagName);
    }

    if (this._hasType(property, this.ns.aml.vocabularies.data.Scalar)) {
      const value = this._computeStructuredExampleValue(property);
      if (value !== undefined) {
        const vn = doc.createTextNode(String(value));
        element.appendChild(vn);
      }
    } else if (this._hasType(property, this.ns.aml.vocabularies.data.Array)) {
      this._processDataArrayProperties(
        doc,
        element || node,
        property,
        tagName,
        isWrapped
      );
    } else if (this._hasType(property, this.ns.aml.vocabularies.data.Object)) {
      this._processDataObjectProperties(doc, element, property);
    } else if (property['@value']) {
      const vn = doc.createTextNode(property['@value']);
      node.appendChild(vn);
      // Skips adding new element
      return;
    }
    if (element) {
      node.appendChild(element);
    }
  }

  /**
   * Computes an example from example structured value.
   *
   * @param {Object} model `structuredValue` item model.
   * @return {Object|Array<Object>} Javascript object or array with structured value.
   * @deprecated Use `amf-example-generator` for examples generation.
   */
  _computeExampleFromStructuredValue(model) {
    if (this._hasType(model, this.ns.aml.vocabularies.data.Scalar)) {
      return this._computeStructuredExampleValue(
        this._getValue(model, this.ns.aml.vocabularies.data.value)
      );
    }
    const isObject = this._hasType(model, this.ns.aml.vocabularies.data.Object);
    const result = isObject ? {} : [];
    const modelKeys = ['@id', '@type'];
    Object.keys(model).forEach(key => {
      if (modelKeys.indexOf(key) !== -1) {
        return;
      }
      const value = this._computeStructuredExampleValue(model[key][0]);
      if (isObject) {
        const name = key.substr(key.indexOf('#') + 1);
        result[name] = value;
      } else {
        result.push(value);
      }
    });
    return result;
  }

  /**
   * Computes value with property data type for a structured example.
   * @param {Object} model Structured example item model.
   * @return {string|boolean|number|null} Value for the example.
   * @deprecated Use `amf-example-generator` for examples generation.
   */
  _computeStructuredExampleValue(model) {
    if (!model) {
      return null;
    }
    if (typeof model === 'string') {
      return model;
    }
    if (this._hasType(model, this.ns.aml.vocabularies.data.Scalar)) {
      const key = this._getAmfKey(this.ns.aml.vocabularies.data.value);
      const mValue = this._ensureArray(model[key])[0];
      const value = mValue['@value'];
      let type = mValue['@type'];
      if (!type) {
        const dtKey = this._getAmfKey(this.ns.w3.shacl.datatype);
        type = this._ensureArray(model[dtKey]);
        if (type) {
          type = type[0]['@id'];
        }
      }
      switch (type) {
        case this.ns.w3.xmlSchema.boolean:
          return value === 'true';
        case this.ns.w3.xmlSchema.integer:
        case this.ns.w3.xmlSchema.long:
        case this.ns.w3.xmlSchema.double:
        case this.ns.w3.xmlSchema.float:
        case this.ns.aml.vocabularies.shapes.number:
          return Number(value);
        default:
          return value;
      }
    }
    return this._computeExampleFromStructuredValue(model);
  }

  /**
   * Adds to the node an XML element which is an array item.
   *
   * @param {Document} doc Main document
   * @param {Element} node Current node
   * @param {Object} property Array item
   * @param {String} name Array property name. Must be already normalized.
   * @param {Boolean} isWrapped Whether RAML's `wrapped` property is set.
   */
  _processDataArrayProperties(doc, node, property, name, isWrapped) {
    let childName;

    if (name.endsWith('s')) {
      childName = name.substr(0, name.length - 1);
    } else {
      childName = name;
    }
    const key = this._getAmfKey(this.ns.w3.rdfSchema.member);
    const items = this._ensureArray(property[key]);
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      if (item instanceof Array) {
        item = item[0];
      }
      this._xmlProcessDataProperty(
        doc,
        node,
        item,
        isWrapped ? childName : name
      );
    }
  }

  /**
   * Adds to the node an XML element which is an object property.
   *
   * @param {Document} doc Main document
   * @param {Object} property Array item
   */
  _processDataObjectProperties(doc, node, property) {
    const resolvedPrefix = this._getAmfKey(
      this.ns.aml.vocabularies.data.toString()
    );
    Object.keys(property).forEach(key => {
      if (key.indexOf(resolvedPrefix) !== 0) {
        return;
      }
      let item = property[key];
      if (item instanceof Array) {
        item = item[0];
      }
      const name = dataNameFromKey(key);
      this._xmlProcessDataProperty(doc, node, item, name);
    });
  }

  _filterReadOnlyProperties(properties) {
    if (!properties) {
      return undefined;
    }
    return properties.filter(p => !this._isPropertyReadOnly(p));
  }

  _isPropertyReadOnly(property) {
    if (Array.isArray(property)) {
      property = property[0];
    }
    const rKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.range);
    const range = property[rKey];
    return this._isReadOnly(range);
  }

  _isReadOnly(node) {
    if (Array.isArray(node)) {
      node = node[0];
    }
    if (!node) {
      return false;
    }
    const roKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.readOnly);
    return this._getValue(node, roKey);
  }

  _getTrackedValue(tracked) {
    const valueKey = this._getAmfKey(
      this.ns.raml.vocabularies.docSourceMaps.value
    );
    if (typeof tracked === 'string' || !tracked) {
      return tracked;
    }
    return (
      /** @type {string} */ (this._getValue(tracked, valueKey)) ||
      tracked['@value']
    );
  }
}
