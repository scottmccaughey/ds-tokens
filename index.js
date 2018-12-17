const minimist = require('minimist');

module.exports = () => {
  let argv = minimist(process.argv.slice(2), {
    alias: {
      m: 'mode',
      i: 'input',
      o: 'output',
      h: 'help',
      v: 'version'
    },
    default: { m: '-', i: '-', o: '-' }
  });

  if (argv.help) {
    require('./help')(argv);
  } else if (argv.version) {
    require('./version')(argv);
  } else if (argv.mode !== '-' && argv.input !== '-' && argv.output !== '-') {
    switch (argv.mode) {
      case 'yaml-to-json':
        require('./yaml-to-json')(argv.input, argv.output);
        break
      case 'json-to-scss':
        require('./json-to-scss')(argv.input, argv.output);
        break
      default:
        console.error('Invalid mode. Try `ds-tokens --help`.');
        break
    }
  } else {
    console.error('Invalid command. Try `ds-tokens --help`.');
  }
}
