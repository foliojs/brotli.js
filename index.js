var brotli = require('./build/all');

exports.compress = require('./compress').bind(brotli);
exports.decompress = require('./decompress').bind(brotli);
