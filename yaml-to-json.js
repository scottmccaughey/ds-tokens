const dir = require('node-dir');
const fs = require('fs');
const yaml = require('yamljs');

module.exports = (input, output) => {

  let tokens = '';
  let comma = '{';

  const reg = /\.ya?ml$/;
  let files = dir.files(input, {
    sync: true
  });

  files = files.filter(function (file, i) {
    if (file.match(reg)) {
      return true;
    } else {
      return false;
    }
  });

  files.forEach(file => {
    const yamlContent = yaml.load(file);
    if (yamlContent !== null) {
      tokens += comma + JSON.stringify(yamlContent, null, '  ').substr(1).slice(0, -2);
      comma = ',';
    }
  });

  tokens += '\n}';

  fs.writeFile(output, tokens, (err) => {
    if (err) throw err;
  });
};
