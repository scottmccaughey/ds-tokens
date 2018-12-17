const fs = require('fs');
const jsonSassMap = require('json-to-sass-map');

// from http://stackoverflow.com/questions/17191265/legal-characters-for-sass-and-scss-variable-names
const escapableCharactersRegex = /(["!#$%&\'()*+,.\/:;\s<=>?@\[\]^\{\}|~])/g;
function replaceEscapableCharacters(str) {
  return str.replace(escapableCharactersRegex, function (a, b) {
    return '\\' + b;
  });
}
const firstCharacterIsNumber = /^[0-9]/;

module.exports = (input, output, opt) => {

  const file = fs.readFileSync(input);
  let parsedJSON;

  parseJSON()
    .then(result => processJSON());

  opt = opt || {};
  opt.delim = opt.delim || '-';
  opt.sass = !!opt.sass;
  opt.eol = opt.sass ? '' : ';';
  opt.ignoreJsonErrors = !!opt.ignoreJsonErrors;
  opt.escapeIllegalCharacters =
    opt.escapeIllegalCharacters === undefined ? true : opt.escapeIllegalCharacters;
  opt.firstCharacter = opt.firstCharacter || '_';
  opt.prefixFirstNumericCharacter =
    opt.prefixFirstNumericCharacter === undefined ? true : opt.prefixFirstNumericCharacter;

  async function parseJSON() {
    parsedJSON = JSON.parse(file);
    return parsedJSON;
  }

  function processJSON() {
    var scssVariables = [];

    loadVariablesRecursive(parsedJSON, '', function pushVariable(assignmentString) {
      scssVariables.push(assignmentString);
    });

    var scss = scssVariables.join('\n');

    fs.writeFile(output, scss, (err) => {
      if (err) throw err;
    });
  }

  function loadVariablesRecursive(obj, path, cb) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var val = obj[key];

        // escape invalid sass characters
        if (opt.escapeIllegalCharacters) {
          key = replaceEscapableCharacters(key);
        }

        // sass variables cannot begin with a number
        if (
          path === '' &&
          firstCharacterIsNumber.exec(key) &&
          opt.prefixFirstNumericCharacter
        ) {
          key = opt.firstCharacter + key;
        }

        if (typeof val !== 'object') {
          cb('$' + path + key + ': ' + val + opt.eol);
        } else {
          if (key.substr(-5) !== '--map') {
            loadVariablesRecursive(val, path + key + opt.delim, cb);
          } else {
            var test = jsonSassMap(
              '{"' + path + key.slice(0, -5) + '": ' + JSON.stringify(val) + '}'
            );
            cb(test);
          }
        }
      }
    }
  }
};
