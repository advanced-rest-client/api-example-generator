/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   api-example-generator.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../amf-helper-mixin/amf-helper-mixin.d.ts" />

declare namespace ApiElements {

  /**
   * `api-example-generator`
   *
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
   */
  class ApiExampleGenerator extends
    ApiElements.AmfHelperMixin(
    Object) {

    /**
     * Lists media types names for payloads.
     * The `payloads` is an array of AMF Payload shape. It can be single Payload
     * shape as a convenient method for compact model.
     *
     * @param payloads List of payloads AMF's Request shape.
     * @returns Returns a list of mime types or undefined
     * if not found.
     */
    listMedia(payloads: Array<object|null>|object|null): Array<String|null>|null|undefined;

    /**
     * Generates a list of examples from an AMF Payloads array for a given media type.
     * The shape can be an Example in which case it will return the example value.
     * If the shape is other shape than Example shape then it looks for examples array and
     * use it to generate values. Otherwise it tries to generate an example from
     * object properties (if object).
     *
     * @param payloads List of payloads to process.
     * @param media A media to for which to generate the examles.
     * @param opts Generation options:
     * - noAuto `Boolean` - When set it only returns examples defined in API spec file.
     * When not set it generates examples from properties when the example is not
     * defined.
     * - type `String` - Type name of an union type. If not set it uses first type
     * - typeName `String` - When generating XML example name of the type to use as main node.
     * @returns Example value.
     */
    generatePayloadsExamples(payloads: Array<object|null>|object|null, media: String|null, opts: object|null): String|null|undefined;

    /**
     * Generates a list of examples for a single AMF Payload shape.
     *
     * @param payload AMF Payload shape.
     * @param mime A mime type to use.
     * @param opts Generation options. See `generatePayloadsExamples()`.
     * @returns List of examples.
     */
    generatePayloadExamples(payload: object|null, mime: String|null, opts: object|null): Array<object|null>|null|undefined;

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
    computeExamples(schema: object|null, mime: String|null, opts: object|null): Array<object|null>|null|undefined;

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
    _computeFromExamples(examples: Array<object|null>|null, mime: String|null, opts: object|null): Array<object|null>|null|undefined;

    /**
     * Uses Example shape's source maps to determine which examples should be rendered.
     *
     * @param examples List of AMF Example schapes.
     * @param typeId Payload ID
     */
    _listTypeExamples(examples: Array<object|null>|null, typeId: String|null): Array<object|null>|null|undefined;

    /**
     * Generate an example from an example shape.
     *
     * @param example Resolved example.
     * @param mime Example content type.
     * @param opts Processing options.
     */
    _generateFromExample(example: object|null, mime: String|null, opts: object|null): String|null|undefined;
    _computeExampleArraySchape(schema: any, mime: any, opts: any): any;
    _computeUnionExamples(schema: any, mime: any, opts: any): any;

    /**
     * Computes value from defined `datatype` property.
     *
     * @param shape A shape with `datatype` property.
     * @returns Value of the data type.
     */
    _computeScalarType(shape: object|null): String|null|undefined;

    /**
     * Creates a JSON example representation from AMF example's structure
     * definition.
     */
    _jsonFromStructure(structure: object|null): any|null;
    _jsonFromStructureValue(value: any, obj: any, isArray: any, key: any, resolvedPrefix: any): void;
    _xmlFromStructure(structure: any, opts: any): any;
    formatXml(xml: any): any;
    _getTypedValue(shape: any): any;

    /**
     * Creates an example from RAML type properties.
     *
     * @param mime Media type
     * @param typeName Name of the RAML type.
     * @param isArray if true the result should be an array
     */
    _exampleFromProperties(properties: any[]|null, mime: String|null, typeName: String|null, isArray: Boolean|null): String|null|undefined;

    /**
     * Generates a JSON example from RAML's type properties.
     *
     * @param properties List of type properties
     */
    _jsonExampleFromProperties(properties: any[]|null): String|null|undefined;

    /**
     * Computes JSON value from a range shape.
     *
     * @param range AMF's range model.
     * @param typeName Optional, type name to use in Union type. By default first NodeShape.
     */
    _computeJsonProperyValue(range: object|null, typeName: String|null): any|null;
    _computeJsonScalarValue(range: any): any;

    /**
     * Computes JSON example from UnionShape
     *
     * @param range Type definition
     * @param typeName Optional, type name to use. By default first NodeShape.
     */
    _computeJsonUnionValue(range: object|null, typeName: String|null): object|null|undefined;
    _computeJsonObjectValue(range: any): any;
    _computeJsonArrayValue(range: any): any;

    /**
     * Gets a value from a Range shape for a scalar value.
     *
     * @param range AMF's range model.
     */
    _getTypeScalarValue(range: object|null): any|null;

    /**
     * Computes example from RAML type for XML media type.
     *
     * @param typeName RAML type name
     */
    _xmlExampleFromProperties(properties: Array<object|null>|null, typeName: String|null): String|null;

    /**
     * Processes an XML property
     *
     * @param doc Main document
     * @param node Current node
     * @param property AMF property
     */
    _xmlProcessProperty(doc: Document|null, node: Element|null, property: object|null): void;

    /**
     * Reads property data type.
     *
     * @returns Data type
     */
    _readDataType(shape: object|null): String|null;

    /**
     * Appends an attribute to the node from AMF property
     *
     * @param node Current node
     * @param property AMF property
     * @param range AMF range
     * @param serialization Serialization info
     */
    _appendXmlAttribute(node: Element|null, property: object|null, range: object|null, serialization: object|null): void;

    /**
     * Appends an element to the node tree from a type
     *
     * @param doc Main document
     * @param node Current node
     * @param property AMF property
     * @param range AMF range
     * @returns Newly created element
     */
    _appendXmlElement(doc: Document|null, node: Element|null, property: object|null, range: object|null): Element|null;
    _appendXmlElements(doc: any, node: any, property: any, range: any): void;
    _appendXmlArray(doc: any, node: any, property: any, range: any, isWrapped: any): void;
    _xmlProcessUnionScalarProperty(doc: any, node: any, property: any, shape: any): void;

    /**
     * Processes XML property from a data shape.
     *
     * @param doc Main document
     * @param node Current node
     * @param property AMF property
     * @param name Current property name
     */
    _xmlProcessDataProperty(doc: Document|null, node: Element|null, property: object|null, name: String|null): void;
    _processDataArrayProperties(doc: any, node: any, property: any, name: any): void;
    _processDataObjectProperties(doc: any, node: any, property: any): void;
    _dataNameFromKey(key: any): any;
  }
}

interface HTMLElementTagNameMap {
  "api-example-generator": ApiElements.ApiExampleGenerator;
}
