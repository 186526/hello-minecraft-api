const packagejson = require("./package.json");
delete packagejson.type;
delete packagejson.devDependencies;
require("fs").writeFileSync(
  "./build/package.json",
  JSON.stringify(packagejson)
);
