export interface Example {
  /**
   * When true then `raw` property has a value
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
   * Whether the example represents a scalar value.
   */
  isScalar: boolean;
  /**
   * The example to render
   */
  value?: string|number|boolean;
  /**
   * Example title, only when `hasTitle` is set.
   */
  title?: string;
  /**
   * Raw value of RAML example. This is only set when raw value is available in the model and 
   * it is not JSON/XML.
   */
  raw?: string;
  /**
   * Example description 
   */
  description?: string;
  /**
   * Only when `hasUnion` is set.
   */
  values?: Example[]; 
}

export interface ExampleOptions {
  /**
   * Lists "raw" examples only.
   */
  rawOnly?: boolean;
  /**
   * Don't generate the example from object properties if the example is
   * not defined in the API file.
   */
  noAuto?: boolean;
  /**
   * Processed type name, used for XML types to use right XML element wrapper name.
   */
  typeName?: string;
  /**
   * It is required to compute examples for a payload. The value of the `@id` of the Payload shape
   */
  typeId?: string;
  parentName?: string;
  /**
   * Value of the `property` property of a NodeShape
   */
  properties?: any[];
  /**
   * When set it ignores adding XML schema header.
   */
  ignoreXmlHeader?: boolean;
}

export interface XmlData {
  /**
   * Value of 'xmlWrapped' property of AMF's object
   */
  isWrapped?: boolean;
  /**
   * Value of 'xmlName' property of AMF's object
   */
  xmlName?: string;
  /**
   * Value of 'xmlAttribute' property of AMF's object
   */
  xmlAttribute?: boolean;
}
