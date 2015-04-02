var fs = require('fs');
var inflate = require('pako/lib/inflate').inflate;

module.exports = function(memoryFile) {
  var src = fs.readFileSync(__dirname + '/../build/' + memoryFile + '.gz');
  return inflate(src);
};
