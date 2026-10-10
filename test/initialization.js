import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';

const source = readFileSync(new URL('../compress.js', import.meta.url), 'utf8');
const input = Uint8Array.of(1, 2, 3);

async function loadCompressor(createEncoder) {
  // Give each test a fresh module and replace only the generated encoder factory.
  const context = createContext();
  const encoder = new SyntheticModule(['default'], function() {
    this.setExport('default', createEncoder);
  }, { context });
  const module = new SourceTextModule(source, { context });
  await module.link(specifier => {
    assert.equal(specifier, './build/encode.js');
    return encoder;
  });
  await module.evaluate();
  return module.namespace.compress;
}

function createTestEncoder(encode = (quality, lgwin, mode, length) => length) {
  return {
    HEAPU8: new Uint8Array(4096),
    _malloc: () => 0,
    _free: () => {},
    _encodeWithDictionary: encode
  };
}

describe('lazy encoder initialization', function() {
  it('does not initialize the encoder during import', async function() {
    let calls = 0;
    await loadCompressor(() => {
      calls++;
      return createTestEncoder();
    });
    assert.equal(calls, 0);
  });

  it('shares pending initialization across concurrent calls and later calls', async function() {
    let calls = 0;
    let initialize;
    const ready = new Promise(resolve => { initialize = resolve; });
    const compress = await loadCompressor(() => {
      calls++;
      return ready;
    });
    const first = compress(input);
    const second = compress(input);
    let settled = false;
    first.then(() => { settled = true; });
    await Promise.resolve();
    assert.equal(calls, 1);
    assert.equal(settled, false);

    initialize(createTestEncoder());
    for (const result of await Promise.all([first, second])) {
      assert.deepEqual(Array.from(result), Array.from(input));
    }
    assert.deepEqual(Array.from(await compress(input)), Array.from(input));
    assert.equal(calls, 1);
  });

  for (const failure of ['throws', 'rejects']) {
    it(`rejects callers without retrying when initialization ${failure}`, async function() {
      let calls = 0;
      const error = new Error('Encoder initialization failed');
      const compress = await loadCompressor(() => {
        calls++;
        if (failure === 'throws') throw error;
        return Promise.reject(error);
      });
      await Promise.all([
        assert.rejects(compress(input), result => result === error),
        assert.rejects(compress(input), result => result === error)
      ]);
      await assert.rejects(compress(input), result => result === error);
      assert.equal(calls, 1);
    });
  }

  it('rejects runtime errors through the compression Promise', async function() {
    const error = new Error('Encoding failed');
    const compress = await loadCompressor(() => createTestEncoder(() => { throw error; }));
    let result;
    assert.doesNotThrow(() => { result = compress(input); });
    await assert.rejects(result, reason => reason === error);
  });

  it('resolves to null when the encoder reports failure', async function() {
    const compress = await loadCompressor(() => createTestEncoder(() => -1));
    assert.equal(await compress(input), null);
  });
});
