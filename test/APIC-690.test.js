import { assert } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import { ExampleGenerator } from '../index.js';

const xmlMime = 'application/xml';

describe('APIC-690', () => {
  let model;
  /** @type ExampleGenerator */
  let instance;

  before(async () => {
    model = await AmfLoader.load(true, 'APIC-690');
  });

  beforeEach(async () => {
    instance = new ExampleGenerator(model);
  });

  it('generates xml examples for an array body', () => {
    const type = AmfLoader.lookupReturnsPayload(model, '/customers', 'get', 200);
    const result = instance.generatePayloadsExamples(type, xmlMime);
    assert.typeOf(result, 'array');
    assert.lengthOf(result, 1);
    
    const example = result[0];
    assert.typeOf(example.raw, 'string', 'has the raw examples');
    assert.typeOf(example.value, 'string', 'has the example value');
    
    const parser = new DOMParser();
    const schema = parser.parseFromString(`<root>${example.value}</root>`, xmlMime);
    
    const root = schema.querySelector('root');
    const nodes = root.querySelectorAll('schema');
    assert.lengthOf(nodes, 2, 'has both examples generated');
    const first = nodes[0];
    
    assert.equal(first.querySelector('customerID').textContent.trim(), '1fe1c22s-3d3a-9n3v', 'has the customerID');
    assert.equal(first.querySelector('firstName').textContent.trim(), 'Molly', 'has the firstName');
    assert.equal(first.querySelector('lastName').textContent.trim(), 'Mule', 'has the lastName');
    assert.equal(first.querySelector('displayName').textContent.trim(), 'Molly the Mule', 'has the displayName');
    assert.equal(first.querySelector('phone').textContent.trim(), '415-000-0000', 'has the phone');
    assert.equal(first.querySelector('email').textContent.trim(), 'molly@mulesoft.com', 'has the email');
    assert.equal(first.querySelector('ssn').textContent.trim(), '321-654-0987', 'has the ssn');
    assert.equal(first.querySelector('dateOfBirth').textContent.trim(), '1990-09-04', 'has the dateOfBirth');
    
    const address = first.querySelector('address');
    assert.ok(address, 'has the address node');

    assert.equal(address.querySelector('addressLine1').textContent.trim(), '123 Street', 'has the address.addressLine1');
    assert.equal(address.querySelector('addressLine2').textContent.trim(), 'Apt.#3D', 'has the address.addressLine2');
    assert.equal(address.querySelector('city').textContent.trim(), 'San Francisco', 'has the address.city');
    assert.equal(address.querySelector('state').textContent.trim(), 'California', 'has the address.state');
    assert.equal(address.querySelector('zipCode').textContent.trim(), '94110', 'has the address.zipCode');
    assert.equal(address.querySelector('country').textContent.trim(), 'United States', 'has the address.country');
  });
});
