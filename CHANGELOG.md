# Changelog

## Unreleased

### Changed

- **Breaking:** Converted the package to ESM only. The package root provides
  named `compress` and `decompress` exports with no default export.
- **Breaking:** `compress()` now returns `Promise<Uint8Array | null>` and must
  be awaited. Compression options, output bytes, and `null` results are unchanged.
  `decompress()` remains synchronous.
- Public entry points are limited to the package root, `brotli/compress`, and
  `brotli/decompress`, including `.js` aliases for both standalone modules.
  Standalone modules default-export their function.
- Encoder initialization is deferred until the first compression call. Concurrent
  calls share one initialization Promise, including failures, with no automatic
  retries. Initialization and runtime errors reject the compression Promise.
- Removed top-level await and enabled modern Node.js `require()` through every
  public entry point. Unflagged ESM loading is supported in Node 20.19+, 22.12+,
  and later releases; see the [Node documentation](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require).
  The distribution remains ESM only.
- Encoding still runs on the calling thread without workers. Keep the input,
  options, and dictionary unchanged until compression settles; no input copying
  is added.

### Added

- Tests for ESM and CommonJS exports, lazy and shared initialization, Promise
  results and failures, and browser bundles, including dictionary initialization
  and decompression without the encoder.

### Migration

```javascript
import { compress, decompress } from 'brotli';

const compressed = await compress(input);
const original = decompress(compressed);
```

To load either function independently:

```javascript
import compress from 'brotli/compress';
import decompress from 'brotli/decompress';
```

Modern Node.js CommonJS consumers can use named root exports or standalone
default exports:

```javascript
const { compress, decompress } = require('brotli');
// Alternatively: const compress = require('brotli/compress').default;

compress(input).then(compressed => {
  const original = decompress(compressed);
}).catch(console.error);
```

Older Node.js CommonJS consumers can continue to use dynamic `import()`.
