var brotli = require('./build/decode');
module.exports = require('./src/decompress').bind(brotli);
