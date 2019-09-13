import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(compact, fileName) {
  compact = compact ? '-compact' : '';
  fileName = fileName || 'demo-api';
  const file = `${fileName}${compact}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.w3.hydra.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.w3.hydra.core + 'method') === operation);
};

AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

AmfLoader.lookupReturnsPayload = function(model, endpoint, operation, code) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const rKey = helper._getAmfKey(helper.ns.w3.hydra.core + 'returns');
  const returns = helper._ensureArray(op[rKey]);
  const response = returns.find((item) => {
    if (helper._getValue(item, helper.ns.w3.hydra.core + 'statusCode') === String(code)) {
      return true;
    }
    return false;
  });
  const pKey = helper._getAmfKey(helper.ns.raml.vocabularies.http + 'payload');
  const payload = response[pKey];
  return payload instanceof Array ? payload : [payload];
};

AmfLoader.lookupType = function(amf, name) {
  if (amf instanceof Array) {
    amf = amf[0];
  }
  helper.amf = amf;
  const dKey = helper._getAmfKey(helper.ns.raml.vocabularies.document + 'declares');
  const declares = helper._ensureArray(amf[dKey]);
  const type = declares.find((item) => {
    // if (!element._hasType(item, element.ns.w3.shacl.name + 'NodeShape')) {
    //   return false;
    // }
    const iName = helper._getValue(item, helper.ns.w3.shacl.name + 'name');
    return name === iName;
  });
  return type;
};

AmfLoader.lookupStructuredValue = function(model, type) {
  helper.amf = model;
  const key = helper._getAmfKey(helper.ns.raml.vocabularies.document + 'examples');
  let example = helper._ensureArray(type[key])[0];
  if (helper._hasType(example, helper.ns.raml.vocabularies.document + 'NamedExamples')) {
    const key = helper._getAmfKey(helper.ns.raml.vocabularies.document + 'examples');
    example = example[key];
    if (example instanceof Array) {
      example = example[0];
    }
  }
  const svKey = helper._getAmfKey(helper.ns.raml.vocabularies.document + 'structuredValue');
  return helper._ensureArray(example[svKey])[0];
};

AmfLoader.lookupTypeProperties = function(model, typeName) {
  const type = AmfLoader.lookupType(model, typeName);
  const pKey = helper._getAmfKey(helper.ns.w3.shacl.name + 'property');
  return helper._ensureArray(type[pKey]);
};
