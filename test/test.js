var fs = require('fs');
var assert = require('assert');
var brotli = require('../');
var decompress = require('../decompress');
var compress = require('../compress');

describe('brotli', function() {
  describe('compress', function() {
    it('should compress some binary data', function() {
      var data = fs.readFileSync('build/decode.js').slice(0, 1024 * 4);
      var res = brotli.compress(data);
      assert(res.length < data.length);
    });
    
    it('should compress some binary data using standalone version', function() {
      var data = fs.readFileSync('build/decode.js').slice(0, 1024 * 4);
      var res = compress(data);
      assert(res.length < data.length);
    });
    
    it('should compress some text data', function() {
      this.timeout(10000); // not sure why the first time text data is compressed it is slow...
      var data = fs.readFileSync('build/decode.js', 'utf8').slice(0, 1024 * 4);
      var res = brotli.compress(data, true);
      assert(res.length < data.length);
    });
    
    it('should compress some text data using standalone version', function() {
      var data = fs.readFileSync('build/decode.js', 'utf8').slice(0, 1024 * 4);
      var res = compress(data, true);
      assert(res.length < data.length);
    });
  });
  
  describe('decompress', function() {
    var data = fs.readFileSync('build/decode.js').slice(0, 1024 * 4);
    var compressed = brotli.compress(data);
    
    it('should decompress some data', function() {
      var res = brotli.decompress(compressed, data.length);
      assert.equal(res.length, data.length);
      assert.deepEqual(new Buffer(res), data);
    });
    
    it('should decompress some data using standalone version', function() {
      var res = decompress(compressed, data.length);
      assert.equal(res.length, data.length);
      assert.deepEqual(new Buffer(res), data);
    });
  });
});
