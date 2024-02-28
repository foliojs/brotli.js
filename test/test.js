var fs = require('fs');
var assert = require('assert');
var brotli = require('../');
var decompress = require('../decompress');
var compress = require('../compress');

describe('brotli', function() {
  describe('compress', function() {
    it('should compress some binary data', async function() {
      // We need this timer, because otherwise the brotli object is empty at the time we try to compress.
      await new Promise(r=>setTimeout(r, 10));
      var data = fs.readFileSync('build/encode.js').slice(0, 1024 * 4);
      var res = brotli.compress(data);
      assert(res.length < data.length);
    });
    
    it('should compress some binary data using standalone version', function() {
      var data = fs.readFileSync('build/encode.js').slice(0, 1024 * 4);
      var res = compress(data);
      assert(res.length < data.length);
    });
    
    it('should compress some text data', function() {
      this.timeout(100000); // not sure why the first time text data is compressed it is slow...
      var data = fs.readFileSync('build/encode.js', 'utf8').slice(0, 1024 * 4);
      var res = brotli.compress(data, true);
      assert(res.length < data.length);
    });
    
    it('should compress some text data using standalone version', function() {
      var data = fs.readFileSync('build/encode.js', 'utf8').slice(0, 1024 * 4);
      var res = compress(data, true);
      assert(res.length < data.length);
    });

    it('compress some text with a dictionary', function() {
      var dictionary = fs.readFileSync(__dirname + '/testdata/alice29.txt');
      var data = fs.readFileSync(__dirname + '/testdata/alice30.txt');
      var res = compress(data, { dictionary: dictionary });
      var diff = fs.readFileSync(__dirname + '/testdata/alice30_diff_from_29.txt.sbr');
      assert(res.length == diff.length);
      // The first char of the output is different between our function and the CLI version.
      // It presumably represents the window size difference when encoding. It has no impact
      // on decoding outcomes.
      assert.deepEqual(res.slice(1), diff.slice(1));
    });
  });
  
  describe('decompress', function() {
    fs.readdirSync(__dirname + '/testdata').forEach(function(file) {
      if (!/\.compressed/.test(file)) return;
      
      it(file, function() {
        var compressed = fs.readFileSync(__dirname + '/testdata/' + file);
        var expected = fs.readFileSync(__dirname + '/testdata/' + file.replace(/\.compressed.*/, ''));
        var result = decompress(compressed);
        assert.deepEqual(new Buffer(result), expected);
      });
    });
  });
  
  describe('roundtrip', function() {
    var files = ['alice29.txt', 'asyoulik.txt', 'lcet10.txt', 'plrabn12.txt'];
    files.forEach(function(file) {
      it(file, function() {
        this.timeout(10000);
        var input = fs.readFileSync(__dirname + '/testdata/' + file);
        var compressed = compress(input);
        var decompressed = decompress(compressed);
        assert.deepEqual(new Buffer(decompressed), input);
      });
    });
  });
});
