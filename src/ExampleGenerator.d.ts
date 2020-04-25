import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

export {ExampleGenerator};
export {ExampleOptions};
export {Example};

declare interface ExampleOptions {
  /**
   * Lists "raw" examples only.
   */
  rawOnly?: boolean;
  /**
   * Don't generate an example from object properties if the example is
   * not defined in the API file.
   */
  noAuto?: boolean;
  /**
   * Processed type name, used for XML types to use right XML element wrapper name.
   */
  typeName?: string;
  /**
   * It is required to compute examples for a payload. The value of
   * the `@id` of the Payload shape.
   */
  typeId?: string;
}

declare interface Example {
  /**
   * Only when `hasUnion` is set.
   */
  hasRaw: boolean;
  /**
   * When true then `title` property has a value
   */
  hasTitle: boolean;
  /**
   * When true then `values` property has a value
   */
  hasUnion: boolean;
  /**
   * The example to render
   */
  value?: string;
  /**
   * Example title, only when `hasTitle` is set.
   */
  title?: string;
  /**
   * Raw value of RAML example. This value is a YAML or JSON
   * schema value. This is only set when raw value is available in the model and it is not JSON/XML.
   */
  raw?: string;
  /**
   * Only when `hasUnion` is set.
   */
  values?: Array<Example>;
}

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
 */
declare class ExampleGenerator extends AmfHelperMixin(Object) {

  /**
   * The AMF model.
   */
  amf: Array<object>|object;

  /**
   * @param amf The AMF model.
   */
  constructor(amf?: Array<object>|object);

  /**
   * Lists media types names for payloads.
   * The `payloads` is an array of AMF Payload shape. It can be single Payload
   * shape as a convenient method for compact model.
   *
   * @param payloads List of payloads AMF's Request shape.
   * @returns Returns a list of mime types or undefined
   * if not found.
   */
  listMedia(payloads: Array<object>|object): string[]|undefined;

  /**
   * Generates a list of examples from an AMF Payloads array for a given media type.
   * The shape can be an Example in which case it will return the example value.
   * If the shape is other shape than Example shape then it looks for examples array and
   * use it to generate values. Otherwise it tries to generate an example from
   * object properties (if object).
   *
   * @param payloads List of payloads to process.
   * @param media A media to for which to generate the examles.
   * @returns Example value.
   */
  generatePayloadsExamples(payloads: Array<object>|object, media: String, opts?: ExampleOptions): Array<Example>|undefined;

  /**
   * Generates a list of examples for a single AMF Payload shape.
   *
   * @param payload AMF Payload shape.
   * @param mime A mime type to use.
   * @returns List of examples.
   */
  generatePayloadExamples(payload: object, mime: String, opts?: ExampleOptions): Array<Example>|undefined;

  /**
   * Computes examples from an AMF shape.
   * It returns examples defined in API spec file. If examples are not defined
   * and `opts.noAuto` flag is not set then it generates an example value from
   * object properties (if an object represents scalar, object, union, or an array).
   *
   * @param schema Any AMF schema.
   * @param mime Examples media type. Currently `application/json` and
   * `application/xml` are supported.
   * @param opts Generation options. See `generatePayloadsExamples()`.
   * Besides that, `opts.typeId` is required to compute examples for a payload.
   * The `typeId` is a value of `@id` of the Payload shape.
   */
  computeExamples(schema: object, mime: String, opts: object): Array<object>|undefined;

  /**
   * Reads a raw value of JSON schema if available.
   *
   * @param schema Schema shape of a type.
   * @returns JSON schema if exists.
   */
  _readJsonSchema(schema: object): String|undefined;

  /**
   * Computes examples value from a list of examples.
   *
   * @param examples List of AMF Example schapes.
   * @param mime Examples media type. Currently `application/json` and
   * `application/xml` are supported.
   * @param opts Generation options. See `generatePayloadsExamples()`.
   * Besides that, `opts.typeId` is required to compute examples for a payload.
   * The `typeId` is a value of `@id` of the Payload shape.
   */
  _computeFromExamples(examples: Array<object>, mime: String, opts: object): Array<object>|undefined;

  /**
   * In AMF 4 the examples model changes from being an array of examples
   * to an object that contains an array of examples.
   * This function extracts the array of examples back to the `examples` variable,
   * respecting that the compact model can be an object instead of array.
   * If the argument is an array with more than one item it means it's pre-4.0.0
   * model.
   *
   * @param examples Examples model.
   * @returns List of examples to process.
   */
  _processExamples(examples: any[]|object): any[]|undefined;

  /**
   * Uses Example shape's source maps to determine which examples should be rendered.
   *
   * @param examples List of AMF Example schapes.
   * @param typeId Payload ID
   */
  _listTypeExamples(examples: Array<object>, typeId: String): Array<object>|undefined;

  /**
   * Generate an example from an example shape.
   *
   * @param example Resolved example.
   * @param mime Example content type.
   * @param opts Processing options.
   */
  _generateFromExample(example: object, mime: String, opts: object): Example|null|undefined;
  _computeExampleArraySchape(schema: any, mime: any, opts: any): any;

  /**
   * Processes JSON examples that should be an arrays and adds brackets
   * if nescesary. When the example is empty string it adds empty string literal
   * to the example value.
   * It does the same for unions which has array of values.
   */
  _processJsonArrayExamples(examples: Array<Example>): void;
  _computeUnionExamples(schema: any, mime: any, opts: any): any;

  /**
   * Computes value from defined `datatype` property.
   *
   * @param shape A shape with `datatype` property.
   * @returns Value of the data type.
   */
  _computeScalarType(shape: object): string|undefined;

  /**
   * Creates a JSON example representation from AMF example's structure
   * definition.
   */
  _jsonFromStructure(structure: object): any;
  _jsonFromStructureValue(value: any, obj: any, isArray: any, key: any, resolvedPrefix: any): void;
  _xmlFromStructure(structure: any, opts: any): any;

  /**
   * Formats XML string into pretty printed value.
   * https://stackoverflow.com/a/2893259/1127848
   *
   * @param xml The XML to process
   * @returns Formatted XML
   */
  formatXml(xml: String): String;
  _getTypedValue(structure: any): any;

  /**
   * Creates a example structure for the JSON schema.
   * Old but still in use.
   *
   * @param schema AMF schema schape
   * @param jsonSchema Raw JSON schema value
   * @returns Generated example model.
   */
  _exampleFromJsonSchema(schema: object, jsonSchema: String): Array<object>;

  /**
   * Creates an example from RAML type properties.
   *
   * @param mime Media type
   * @param typeName Name of the RAML type.
   * @param parentType For XML processing, parent type name in case of Array type.
   */
  _exampleFromProperties(properties: any[], mime: string, typeName?: string, parentType?: string): Example|undefined;

  /**
   * Generates a JSON example from RAML's type properties.
   *
   * @param properties List of type properties
   */
  _jsonExampleFromProperties(properties: Array<object>): object|null|undefined;

  /**
   * Computes JSON value from a range shape.
   *
   * @param range AMF's range model.
   * @param typeName Optional, type name to use in Union type. By default first NodeShape.
   */
  _computeJsonProperyValue(range: object, typeName?: string): any|null;
  _computeJsonScalarValue(range: any): any;

  /**
   * Casts the value to given data type represented in AMF notation.
   *
   * @param value Value encoded in AMF
   * @param type AMF data type
   * @returns Casted value.
   */
  _typeToValue(value: string, type: string): String|Number|Boolean|null;

  /**
   * Computes JSON example from UnionShape
   *
   * @param range Type definition
   * @param typeName Optional, type name to use. By default first NodeShape.
   */
  _computeJsonUnionValue(range: object, typeName?: String): object|undefined;
  _computeJsonObjectValue(range: any): any;
  _computeJsonArrayValue(range: any): any;
  _extractExampleRawValue(example: any): any;

  /**
   * Gets a value from a Range shape for a scalar value.
   *
   * @param range AMF's range model.
   */
  _getTypeScalarValue(range: object): any;

  /**
   * Computes example from RAML type for XML media type.
   *
   * @param typeName RAML type name
   * @param parentType When the XML is an array type it is the parent type
   */
  _xmlExampleFromProperties(properties: Array<object>, typeName?: String, parentType?: String): String;

  /**
   * Processes an XML property
   *
   * @param doc Main document
   * @param node Current node
   * @param property AMF property
   */
  _xmlProcessProperty(doc: Document, node: Element, property: object): void;

  /**
   * Appends XML example data to a node from an example defined on a "range"
   * property. This way it does not generate example values from type values
   * but uses object's example.
   *
   * @param doc XML document
   * @param node A node to which append values
   * @param example AMF's example definition.
   * @param propertyName Name of the property being processed
   */
  _xmlFromExamples(doc: Document, node: Element, example: object, propertyName: String): void;

  /**
   * Reads property data type.
   *
   * @returns Data type
   */
  _readDataType(shape: object): String;

  /**
   * Appends an attribute to the node from AMF property
   *
   * @param node Current node
   * @param range AMF range
   * @param serialization Serialization info
   */
  _appendXmlAttribute(node: Element, range: object, serialization: object): void;

  /**
   * Appends an element to the node tree from a type
   *
   * @param doc Main document
   * @param node Current node
   * @param range AMF range
   * @returns Newly created element
   */
  _appendXmlElement(doc: Document, node: Element, range: object): Element;

  /**
   * Appends a list of elements to the node tree from a type
   *
   * @param doc Main document
   * @param node Current node
   * @param range AMF range
   */
  _appendXmlElements(doc: Document, node: Element, range: object): void;
  _appendXmlArray(doc: Document, node: Element, range: object, isWrapped: any): void;

  /**
   * Processes scalara property that is an union in an XML example.
   *
   * @param doc Main document
   * @param property A property to process
   * @param shape AMF shape of a property in the union
   */
  _xmlProcessUnionScalarProperty(doc: Document, property: object, shape: object): void;

  /**
   * Normalizes given name to a value that can be accepted by `createElement`
   * function on a document object.
   *
   * @param name A name to process
   * @returns Normalized name
   */
  _normalizeXmlTagName(name: String): String|null;

  /**
   * Processes XML property from a data shape.
   *
   * @param doc Main document
   * @param node Current node
   * @param property AMF property
   * @param name Current property name
   */
  _xmlProcessDataProperty(doc: Document, node: Element, property: object, name: string): void;

  /**
   * Computes an example from example structured value.
   *
   * @param model `structuredValue` item model.
   * @returns Javascript object or array with structured value.
   */
  _computeExampleFromStructuredValue(model: object): object|any[]|null;

  /**
   * Computes value with propert data type for a structured example.
   *
   * @param model Structured example item model.
   * @returns Value for the example.
   */
  _computeStructuredExampleValue(model: object): string|boolean|number;
  _processDataArrayProperties(doc: Document, node: Element, property: object, name: string): void;
  _processDataObjectProperties(doc: Document, node: Element, property: object): void;
  _dataNameFromKey(key: string): string;
}
