const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('se-8987/se-8987.raml', 'RAML 1.0');

generator(files)
.then(() => console.log('Finito'));
