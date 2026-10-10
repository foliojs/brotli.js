import fs from 'node:fs';
import assert from 'node:assert';
import * as brotli from 'brotli';
import decompress from 'brotli/decompress';
import compress from 'brotli/compress';

const encoderFile = new URL('../build/encode.js', import.meta.url);
const testdata = new URL('./testdata/', import.meta.url);

describe('brotli', function() {
  describe('compress', function() {
    it('should compress some binary data', function() {
      var data = fs.readFileSync(encoderFile).slice(0, 1024 * 4);
      var res = brotli.compress(data);
      assert(res.length < data.length);
    });

    it('should compress some binary data using standalone version', function() {
      var data = fs.readFileSync(encoderFile).slice(0, 1024 * 4);
      var res = compress(data);
      assert(res.length < data.length);
    });

    it('should compress some text data', function() {
      this.timeout(100000); // not sure why the first time text data is compressed it is slow...
      var data = fs.readFileSync(encoderFile, 'utf8').slice(0, 1024 * 4);
      var res = brotli.compress(data, true);
      assert(res.length < data.length);
    });

    it('should compress some text data using standalone version', function() {
      var data = fs.readFileSync(encoderFile, 'utf8').slice(0, 1024 * 4);
      var res = compress(data, true);
      assert(res.length < data.length);
    });

    it('compress some text with a dictionary', function() {
      var dictionary = fs.readFileSync(new URL('alice29.txt', testdata));
      var data = fs.readFileSync(new URL('alice30.txt', testdata));
      var res = compress(data, { dictionary: dictionary });
      var diff = fs.readFileSync(new URL('alice30_diff_from_29.txt.sbr', testdata));
      assert(res.length == diff.length);
      // The first char of the output is different between our function and the CLI version.
      // It presumably represents the window size difference when encoding. It has no impact
      // on decoding outcomes.
      assert.deepEqual(res.slice(1), diff.slice(1));
    });

    it('should compress short data', function() {
      let res = compress(Buffer.from([255, 255, 255]));
      assert(res.length > 3);
    });
  });

  describe('decompress', function() {
    fs.readdirSync(testdata).forEach(function(file) {
      if (!/\.compressed/.test(file)) return;

      it(file, function() {
        var compressed = fs.readFileSync(new URL(file, testdata));
        var expected = fs.readFileSync(new URL(file.replace(/\.compressed.*/, ''), testdata));
        var result = decompress(compressed);
        assert.deepEqual(Buffer.from(result), expected);
      });
    });
  });

  describe('roundtrip', function() {
    var files = ['alice29.txt', 'asyoulik.txt', 'lcet10.txt', 'plrabn12.txt'];
    files.forEach(function(file) {
      it(file, function() {
        this.timeout(10000);
        var input = fs.readFileSync(new URL(file, testdata));
        var compressed = compress(input);
        var decompressed = decompress(compressed);
        assert.deepEqual(Buffer.from(decompressed), input);
      });
    });
  });
});
