var brotli = require('./build/encode');
module.exports = require('./src/compress').bind(brotli);
