import fs from 'node:fs';
import assert from 'node:assert';
import zlib from 'node:zlib';
import * as brotli from 'brotli';
import { decompress } from 'brotli/decompress';
import { compress } from 'brotli/compress';

const encoderFile = new URL('../build/encode.js', import.meta.url);
const testdata = new URL('./testdata/', import.meta.url);

describe('brotli', function() {
  describe('compress', function() {
    it('should compress some binary data', async function() {
      var data = fs.readFileSync(encoderFile).slice(0, 1024 * 4);
      var res = await brotli.compress(data);
      assert(res.length < data.length);
    });

    it('should compress some binary data using standalone version', async function() {
      var data = fs.readFileSync(encoderFile).slice(0, 1024 * 4);
      var res = await compress(data);
      assert(res.length < data.length);
    });

    it('should compress some text data', async function() {
      this.timeout(100000); // not sure why the first time text data is compressed it is slow...
      var data = fs.readFileSync(encoderFile, 'utf8').slice(0, 1024 * 4);
      var res = await brotli.compress(data, true);
      assert(res.length < data.length);
    });

    it('should compress some text data using standalone version', async function() {
      var data = fs.readFileSync(encoderFile, 'utf8').slice(0, 1024 * 4);
      var res = await compress(data, true);
      assert(res.length < data.length);
    });

    it('compress some text with a dictionary', async function() {
      var dictionary = fs.readFileSync(new URL('alice29.txt', testdata));
      var data = fs.readFileSync(new URL('alice30.txt', testdata));
      var res = await compress(data, { dictionary: dictionary });
      var diff = fs.readFileSync(new URL('alice30_diff_from_29.txt.sbr', testdata));
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

    it('should compress empty data to a valid stream', async function() {
      let res = await compress(Buffer.alloc(0));
      assert(res.length > 0);
      assert.equal(zlib.brotliDecompressSync(res).length, 0);
    });

    // Inputs larger than one encoder block (the block size depends on
    // quality and lgwin) used to decode to only the first block.
    [
      ['repetitive', 1 << 20, { quality: 2 }],
      ['repetitive', 100000, { quality: 1, lgwin: 16 }],
      ['repetitive', 300000, { quality: 9, lgwin: 16 }],
      ['random', 1 << 20, { quality: 2 }],
      ['random', 300000, { quality: 9, lgwin: 16 }],
      // fast modes with a small window add ~3 header bytes per KiB
      ['random', 1 << 20, { quality: 1, lgwin: 10 }],
    ].forEach(function([kind, size, opts]) {
      it(`should compress all of ${size} bytes of ${kind} data with ${JSON.stringify(opts)}`, async function() {
        this.timeout(30000);
        let input = kind === 'random' ? randomBytes(size) : repetitiveBytes(size);
        let res = await compress(input, opts);
        assert.deepEqual(zlib.brotliDecompressSync(res), input);
        assert.deepEqual(Buffer.from(decompress(res)), input);
      });
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
      it(file, async function() {
        this.timeout(10000);
        var input = fs.readFileSync(new URL(file, testdata));
        var compressed = await compress(input);
        var decompressed = decompress(compressed);
        assert.deepEqual(Buffer.from(decompressed), input);
      });
    });
  });
});

function repetitiveBytes(size) {
  let buf = Buffer.alloc(size);
  for (let i = 0; i < size; i++) buf[i] = (Math.imul(i, 2654435761) >>> 13) & 3 | 0x30;
  return buf;
}

// deterministic xorshift32 so failures are reproducible
function randomBytes(size) {
  let buf = Buffer.alloc(size);
  let x = 2463534242;
  for (let i = 0; i < size; i++) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    buf[i] = x & 0xff;
  }
  return buf;
}
