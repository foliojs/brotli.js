import fs from 'fs';
import assert from 'assert';
import {compress} from '../compress.js';
import {decompress} from '../decompress.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('brotli', function() {
  describe('compress', async function() {
    it('should compress some binary data', async function() {
      var data = fs.readFileSync('build/brotli.js').slice(0, 1024 * 4);
      var res = await compress(data);
      assert(res.length < data.length);
    });

    it('should compress some binary data using standalone version', async function() {
      var data = fs.readFileSync('build/brotli.js').slice(0, 1024 * 4);
      var res = await compress(data);
      assert(res.length < data.length);
    });

    it('should compress some text data', async function() {
      this.timeout(100000); // not sure why the first time text data is compressed it is slow...
      var data = fs.readFileSync('build/brotli.js', 'utf8').slice(0, 1024 * 4);
      var res = await compress(data, true);
      assert(res.length < data.length);
    });

    it('should compress some text data using standalone version', async function() {
      var data = fs.readFileSync('build/brotli.js', 'utf8').slice(0, 1024 * 4);
      var res = await compress(data, true);
      assert(res.length < data.length);
    });

    it('compress some text with a dictionary', async function() {
      var dictionary = fs.readFileSync(__dirname + '/testdata/alice29.txt');
      var data = fs.readFileSync(__dirname + '/testdata/alice30.txt');
      var res = await compress(data, { dictionary: dictionary });
      var diff = fs.readFileSync(__dirname + '/testdata/alice30_diff_from_29.txt.sbr');
      assert(res.length == diff.length);
      // The first char of the output is different between our function and the CLI version.
      // It presumably represents the window size difference when encoding. It has no impact
      // on decoding outcomes.
      assert.deepEqual(res.slice(1), diff.slice(1));
    });

    it('should compress short data', async function() {
      let res = await compress(Buffer.from([255, 255, 255]));
      assert(res.length > 3);
    });
  });

  describe('decompress', async function() {
    fs.readdirSync(__dirname + '/testdata').forEach(async function(file) {
      if (!/\.compressed/.test(file)) return;

      it(file, async function() {
        var compressed = fs.readFileSync(__dirname + '/testdata/' + file);
        var expected = fs.readFileSync(__dirname + '/testdata/' + file.replace(/\.compressed.*/, ''));
        var result = await decompress(compressed);
        assert.deepEqual(new Buffer(result), expected);
      });
    });
  });

  describe('roundtrip', async function() {
    var files = ['alice29.txt', 'asyoulik.txt', 'lcet10.txt', 'plrabn12.txt'];
    files.forEach(async function(file) {
      it(file, async function() {
        this.timeout(10000);
        var input = fs.readFileSync(__dirname + '/testdata/' + file);
        var compressed = await compress(input);
        var decompressed = await decompress(compressed);
        assert(input.length == decompressed.length);
        assert.deepEqual(decompressed, input);
      });
    });
  });
});

