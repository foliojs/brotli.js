import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createContext, SourceTextModule } from 'node:vm';
import { build } from 'esbuild';
import { dictionary } from '../dec/dictionary-data.js';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const input = readFileSync(new URL('./testdata/quickfox', import.meta.url));
const compressedFixture = readFileSync(new URL('./testdata/quickfox.compressed', import.meta.url));
const dictionaryHash = createHash('sha256').update(dictionary).digest('hex');

function bundle(entry, platform = 'browser') {
  return build({
    absWorkingDir: repositoryRoot,
    stdin: {
      contents: entry + "\nexport { dictionary } from './dec/dictionary.js';",
      resolveDir: repositoryRoot,
      sourcefile: `${platform}-entry.js`
    },
    bundle: true,
    platform,
    mainFields: ['main'],
    format: 'esm',
    target: 'es2022',
    metafile: true,
    write: false
  });
}

async function verifyInBrowserContext(result) {
  // Keep Node globals outside the VM so the bundle must be self-contained.
  const module = new SourceTextModule(result.outputFiles[0].text, {
    context: createContext({ TextDecoder })
  });
  await module.link(() => { throw new Error('Unexpected external browser dependency'); });
  await module.evaluate();
  assert.equal(module.namespace.dictionary.length, dictionary.length);
  assert.equal(createHash('sha256').update(module.namespace.dictionary).digest('hex'), dictionaryHash);
  assert.deepEqual(Array.from(module.namespace.decompress(compressedFixture)), Array.from(input));
  return module.namespace;
}

describe('browser ESM bundles', function() {
  this.timeout(10000);

  it('initializes the browser dictionary and round-trips data with async compression', async function() {
    const result = await bundle("export { compress, decompress } from 'brotli';");
    const inputs = Object.keys(result.metafile.inputs);
    assert(inputs.includes('dec/dictionary-browser.js'));
    assert(!inputs.includes('dec/dictionary-data.js'));
    const browser = await verifyInBrowserContext(result);
    const compressed = await browser.compress(input);
    assert.equal(Object.prototype.toString.call(compressed), '[object Uint8Array]');
    assert.deepEqual(Array.from(browser.decompress(compressed)), Array.from(input));
  });

  it('decodes with the standalone entry without including the encoder', async function() {
    const result = await bundle("export { decompress } from 'brotli/decompress';");
    const inputs = Object.keys(result.metafile.inputs);
    assert(inputs.includes('dec/dictionary-browser.js'));
    assert(!inputs.includes('dec/dictionary-data.js'));
    assert(!inputs.includes('build/encode.js'));
    assert(!inputs.includes('compress.js'));
    await verifyInBrowserContext(result);
  });
});

describe('conditional dictionary imports', function() {
  it('uses the inline dictionary in native Node.js', async function() {
    const { initData } = await import('#dictionary-data');
    assert.equal(initData(), dictionary);
  });

  it('bundles the inline dictionary for Node.js', async function() {
    const result = await bundle("export { decompress } from 'brotli/decompress';", 'node');
    const inputs = Object.keys(result.metafile.inputs);
    assert(inputs.includes('dec/dictionary-data.js'));
    assert(!inputs.includes('dec/dictionary-browser.js'));
    assert(!inputs.includes('dec/dictionary.bin.js'));
    assert(!inputs.some(path => path.includes('base64-js')));
    await verifyInBrowserContext(result);
  });

  it('bundles the compressed dictionary without environment conditions', async function() {
    const result = await bundle("export { decompress } from 'brotli/decompress';", 'neutral');
    const inputs = Object.keys(result.metafile.inputs);
    assert(inputs.includes('dec/dictionary-browser.js'));
    assert(inputs.includes('dec/dictionary.bin.js'));
    assert(!inputs.includes('dec/dictionary-data.js'));
    await verifyInBrowserContext(result);
  });
});
