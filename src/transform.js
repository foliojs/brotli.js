var through = require('through');
var brfs = require('brfs');
var path = require('path');

var build;
module.exports = function(file) {
  // browserify builds the emscripten file right before read_memory.js,
  // so we can track which memory file to build this way
  if (/build/.test(file)) {
    build = file;
    return through();
  }
  
  // use brfs to inject the memoryFile variable statically
  return brfs(file, {
    vars: {
      memoryFile: path.basename(build) + '.mem'
    }
  });
};
