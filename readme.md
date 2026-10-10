# Brotli.js

Brotli.js is port of the [Brotli](http://tools.ietf.org/html/draft-alakuijala-brotli-01) compression algorithm (as used in the [WOFF2](http://www.w3.org/TR/WOFF2/) font format) to JavaScript. The decompressor is hand ported, and the compressor is ported
with Emscripten.  The original C++ source code can be found [here](http://github.com/google/brotli).

## Installation and usage

Install using npm.

    npm install brotli

Brotli.js is an ESM-only package. Import its named functions in Node.js or a
browser bundler:

```javascript
import { compress, decompress } from 'brotli';
```

TypeScript declarations are included for all public entry points. The
`CompressOptions` type is available from `brotli` and `brotli/compress`.

The public entry points have no default exports. Modern Node.js can also load
these ES modules with `require()` without a flag: Node 20.19+, 22.12+, and later
releases support this [Node interoperability feature](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require).

```javascript
const { compress, decompress } = require('brotli');

compress(Buffer.from('Hello, Brotli!')).then(compressed => {
  const original = decompress(compressed);
  console.log(Buffer.from(original).toString());
}).catch(console.error);
```

On older Node.js versions, CommonJS applications can use dynamic `import()`.

You can also import either function on its own, which is useful for browser
builds. The standalone modules export their named function; both subpaths
also accept a `.js` extension.

```javascript
import { decompress } from 'brotli/decompress';
import { compress } from 'brotli/compress';
```

With modern Node.js `require()`, destructure the standalone functions:

```javascript
const { compress } = require('brotli/compress');
const { decompress } = require('brotli/decompress');
```

`compress()` returns a Promise and initializes the encoder lazily on its first
call. Concurrent calls share the same initialization Promise, and a failed
initialization is not retried. `decompress()` remains synchronous. No startup
timer or initialization call is needed, and the package does not use top-level
await. Browser bundlers must support ESM and conditional `package.json` imports;
the browser tests target ESM/ES2022. The internal `#dictionary-data` import uses
the inline dictionary under the `node` condition and the compressed dictionary
under `default`, including browser builds.
Importing only `brotli/decompress` does not load the encoder.

## Building from source

Building this repository requires Git, Make, Python 3, Node.js, and the
[Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html).
The `emcc` compiler is provided by Emscripten, not by npm.

From the repository root, initialize the Brotli sources and install a local SDK:

```sh
git submodule update --init --recursive
git clone https://github.com/emscripten-core/emsdk.git .emsdk
./.emsdk/emsdk install 6.0.12
./.emsdk/emsdk activate 6.0.12
npm ci
npm test
```

`npm ci` runs `make` through the `prepublish` script and generates
`build/encode.js` as an ES module. The Makefile automatically uses the compiler
in `.emsdk`.
The local SDK is excluded from Git and npm packages.

If Emscripten is already installed elsewhere, activate its environment with
`source /path/to/emsdk/emsdk_env.sh` before installing dependencies. You can
also select a compiler explicitly with `make EMCC=/path/to/emcc`.
Run `make` to rebuild the encoder and `make clean` to remove generated files.

## API

### decompress(buffer, [outSize])

Decompresses the given buffer to produce the original input to the compressor.
The `outSize` parameter is optional, and will be computed by the decompressor
if not provided. Inside a WOFF2 file, this can be computed from the WOFF2 directory.

```javascript
import { readFileSync } from 'node:fs';
import { decompress } from 'brotli';

// decode a buffer where the output size is known
decompress(compressedData, uncompressedLength);

// decode a buffer where the output size is not known
decompress(readFileSync('compressed.bin'));
```

### compress(buffer, options)

Compresses the given buffer and returns `Promise<Uint8Array | null>`. Pass
optional parameters as the second argument. The Promise resolves to `null`
when the encoder reports failure; initialization and runtime errors reject it.

Encoding runs on the calling thread after initialization; this API does not
use workers or move CPU work off that thread. Input and options are not copied
before initialization: keep the input buffer, options, and dictionary unchanged
until the Promise settles.

```javascript
import { readFileSync } from 'node:fs';
import { compress } from 'brotli';

// encode a buffer of binary data
const compressed = await compress(readFileSync('myfile.bin'));

// encode some data with options (default options shown)
const compressedWithOptions = await compress(readFileSync('myfile.bin'), {
  mode: 0, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 11, // 0 - 11
  lgwin: 22, // window size
  dictionary: ''
});
```

## License

MIT
