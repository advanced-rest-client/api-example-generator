const generator = require('@api-components/api-model-generator');

/** @typedef {import('@api-components/api-model-generator/types').ApiConfiguration} ApiConfiguration */

/** @type Map<string, ApiConfiguration> */
const files = new Map();

files.set('demo-api/demo-api.raml', { type: 'RAML 1.0' });
files.set('se-8987/se-8987.raml', { type: 'RAML 1.0' });
files.set('SE-10469/SE-10469.raml', { type: 'RAML 1.0' });
files.set('tracked-examples/tracked-to-linked.raml', { type: 'RAML 1.0' });
files.set('APIC-188/APIC-188.raml', { type: 'RAML 1.0' });
files.set('APIC-187/APIC-187.raml', { type: 'RAML 1.0' });
files.set('APIC-233/APIC-233.raml', { type: 'RAML 0.8' });
files.set('SE-13092/SE-13092.raml', { type: 'RAML 1.0' });
files.set('SE-14813/SE-14813.raml', { type: 'RAML 1.0' });
files.set('APIC-391/APIC-391.raml', { type: 'RAML 1.0' });
files.set('APIC-487/APIC-487.raml', { type: 'RAML 1.0' });
files.set('APIC-499/APIC-499.raml', { type: 'RAML 1.0' });
files.set('APIC-655/APIC-655.raml', { type: 'RAML 1.0' });
files.set('SE-22063/SE-22063.raml', { type: 'RAML 1.0' });
files.set('APIC-332/APIC-332.raml', { type: 'RAML 1.0' });
files.set('APIC-690/APIC-690.raml', { type: 'RAML 1.0' });
files.set('oas-3-api/oas-3-api.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });
files.set('allof-types/allof-types.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });
files.set('APIC-679/APIC-679.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });

generator.generate(files);
