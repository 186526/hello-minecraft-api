const packagejson = require('./package.json');
delete packagejson.type;
require('fs').writeFileSync('./build/package.json', JSON.stringify(packagejson));