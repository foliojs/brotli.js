import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as brotli from 'brotli';
import compress from 'brotli/compress';
import compressWithExtension from 'brotli/compress.js';
import decompress from 'brotli/decompress';
import decompressWithExtension from 'brotli/decompress.js';

// Exercise the encoder during module evaluation, before Mocha runs any tests.
const input = new TextEncoder().encode('Ready immediately after import.');
const compressed = brotli.compress(input);

describe('ESM entry points', function() {
  it('exposes only named compress and decompress exports at the root', function() {
    assert.deepEqual(Object.keys(brotli).sort(), ['compress', 'decompress']);
  });

  it('shares functions with standalone imports and their .js aliases', function() {
    assert.equal(brotli.compress, compress);
    assert.equal(compress, compressWithExtension);
    assert.equal(brotli.decompress, decompress);
    assert.equal(decompress, decompressWithExtension);
  });

  it('compresses and decompresses synchronously immediately after import', function() {
    assert(compressed instanceof Uint8Array);
    assert.deepEqual(decompress(compressed), input);
  });

  it('rejects CommonJS require through every public entry point', function() {
    const require = createRequire(import.meta.url);
    for (const entry of ['brotli', 'brotli/compress', 'brotli/compress.js', 'brotli/decompress', 'brotli/decompress.js']) {
      assert.throws(() => require(entry), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
    }
  });
});
