import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as brotli from 'brotli';
import { compress } from 'brotli/compress';
import { compress as compressWithExtension } from 'brotli/compress.js';
import { decompress } from 'brotli/decompress';
import { decompress as decompressWithExtension } from 'brotli/decompress.js';

const input = new TextEncoder().encode('Async compression with synchronous decompression.');

describe('ESM entry points', function() {
  it('exposes only named functions through every public entry point', async function() {
    assert.deepEqual(Object.keys(brotli).sort(), ['compress', 'decompress']);
    for (const name of ['compress', 'decompress']) {
      for (const entry of [`brotli/${name}`, `brotli/${name}.js`]) {
        assert.deepEqual(Object.keys(await import(entry)), [name]);
      }
    }
  });

  it('shares functions with standalone imports and their .js aliases', function() {
    assert.equal(brotli.compress, compress);
    assert.equal(compress, compressWithExtension);
    assert.equal(brotli.decompress, decompress);
    assert.equal(decompress, decompressWithExtension);
  });

  it('returns a compression Promise and decompresses its result synchronously', async function() {
    const result = brotli.compress(input);
    assert(result instanceof Promise);
    const compressed = await result;
    assert(compressed instanceof Uint8Array);
    assert.deepEqual(decompress(compressed), input);
  });

  it('loads and round-trips through every CommonJS entry point', async function() {
    const require = createRequire(import.meta.url);
    const root = require('brotli');
    assert.equal(root.compress, compress);
    assert.equal(root.decompress, decompress);
    assert(!('default' in root));
    assert.deepEqual(root.decompress(await root.compress(input)), input);

    for (const entry of ['brotli/compress', 'brotli/compress.js']) {
      const module = require(entry);
      assert.deepEqual(Object.keys(module), ['compress']);
      const standalone = module.compress;
      assert.equal(standalone, compress);
      assert.deepEqual(decompress(await standalone(input)), input);
    }
    const compressed = await compress(input);
    for (const entry of ['brotli/decompress', 'brotli/decompress.js']) {
      const module = require(entry);
      assert.deepEqual(Object.keys(module), ['decompress']);
      const standalone = module.decompress;
      assert.equal(standalone, decompress);
      assert.deepEqual(standalone(compressed), input);
    }
  });
});
