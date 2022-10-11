/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(Object) {}
const helper = new HelperElement();

/**
 * Loads API model data
 * @param {Boolean} [compact=false] Whether to download compact model
 * @param {String=} [file='demo-api'] API model file name
 * @return {Promise<Object>}
 */
AmfLoader.load = async function(compact=false, file='demo-api') {
  const suffix = compact ? '-compact' : '';
  const fullFile = `${file}${suffix}.json`;
  const url = `${window.location.protocol}//${window.location.host}/base/demo/${fullFile}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download API model from ${url}`);
  }
  return response.json();
};

/**
 * Looks for an endpoint
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @return {Object}
 */
AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

/**
 * Looks for an operation
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Object}
 */
AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

/**
 * Looks for a payload in an operation
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Array<Object>}
 */
AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  if (!expects) {
    throw new Error(`The ${operation.toUpperCase()} ${endpoint} operation has no request definition.`);
  }
  return helper._ensureArray(helper._computePayload(expects));
};

/**
 * Looks for headers in an operation
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {Array<Object>}
 */
AmfLoader.lookupExpectsHeaderSchema = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  if (!expects) {
    throw new Error(`The ${operation.toUpperCase()} ${endpoint} operation has no request definition.`);
  }
  const headers = helper._computeHeaders(expects);
  const sKey = helper._getAmfKey(helper.ns.aml.vocabularies.shapes.schema);
  return headers[0][sKey];
};

/**
 * Looks for a payload in the responses list of an operation
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @param {number} code Status code of the response
 * @return {Array<Object>}
 */
AmfLoader.lookupReturnsPayload = function(model, endpoint, operation, code) {
  helper.amf = model;
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const rKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.returns);
  const returns = helper._ensureArray(op[rKey]);
  const response = returns.find((item) => {
    if (helper._getValue(item, helper.ns.aml.vocabularies.apiContract.statusCode) === String(code)) {
      return true;
    }
    return false;
  });
  const pKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.payload);
  const payload = response[pKey];
  return Array.isArray(payload) ? payload : [payload];
};

/**
 * Looks for a type in the model
 * @param {any} amf AMF model
 * @param {string} name Name of the type
 * @return {Object}
 */
AmfLoader.lookupType = function(amf, name) {
  if (Array.isArray(amf)) {
    [amf] = amf;
  }
  helper.amf = amf;
  const dKey = helper._getAmfKey(helper.ns.raml.vocabularies.document.declares);
  const declares = helper._ensureArray(amf[dKey]);
  const type = declares.find((item) => {
    // if (!element._hasType(item, element.ns.w3.shacl.name + 'NodeShape')) {
    //   return false;
    // }
    const iName = helper._getValue(item, helper.ns.w3.shacl.name);
    return name === iName;
  });
  return type;
};

/**
 * Looks for the `structuredValue` in an example model in the model
 * @param {Object} model AMF shape for example
 * @param {string} type Name of the type
 * @return {Object}
 */
AmfLoader.lookupStructuredValue = function(model, type) {
  helper.amf = model;
  const key = helper._getAmfKey(helper.ns.raml.vocabularies.apiContract.examples);
  let example = helper._ensureArray(type[key])[0];
  if (helper._hasType(example, helper.ns.raml.vocabularies.document.NamedExamples)) {
    const k = helper._getAmfKey(helper.ns.raml.vocabularies.document.examples);
    example = example[k];
    if (Array.isArray(example)) {
      [example] = example;
    }
  }
  const svKey = helper._getAmfKey(helper.ns.raml.vocabularies.document.structuredValue);
  return helper._ensureArray(example[svKey])[0];
};

/**
 * Looks for a type in the model
 * @param {any} model
 * @param {string} typeName Name of the type
 * @return {Object}
 */
AmfLoader.lookupTypeProperties = function(model, typeName) {
  const type = AmfLoader.lookupType(model, typeName);
  const pKey = helper._getAmfKey(helper.ns.w3.shacl.property);
  return helper._ensureArray(type[pKey]);
};

/**
 * Looks for a property range in a type
 * @param {any} model
 * @param {string} typeName Name of the type
 * @param {Number} index
 * @return {Object}
 */
AmfLoader.lookupTypePropertyRange = function(model, typeName, index) {
  const props = AmfLoader.lookupTypeProperties(model, typeName);
  const prop = props[index];
  const rKey = helper._getAmfKey(helper.ns.raml.vocabularies.shapes.range);
  let range = prop[rKey];
  if (Array.isArray(range)) {
    [range] = range;
  }
  return range;
};

/**
 * Looks for a schema of a payload in the AMF model
 * @param {any} model
 * @param {string} endpoint Endpoint's path
 * @param {string} method Operation name (lowercase)
 * @param {Number} [payloadIndex=0] Index of the payload
 * @return {Array<Object>}
 */
AmfLoader.lookupPayloadSchema = function(model, endpoint, method, payloadIndex=0) {
  const payload = AmfLoader.lookupPayload(model, endpoint, method)[payloadIndex];
  const sKey = helper._getAmfKey(helper.ns.aml.vocabularies.shapes.schema);
  return helper._ensureArray(payload[sKey]);
};
