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

There is no default export at the package root, and CommonJS `require()` is not
supported. CommonJS applications can load the package with dynamic `import()`.

You can also import either function on its own, which is useful for browser
builds. The standalone modules default-export their function; both subpaths
also accept a `.js` extension.

```javascript
import decompress from 'brotli/decompress';
import compress from 'brotli/compress';
```

The compressor initializes once using top-level await during module loading.
After the import completes, `compress()` and `decompress()` are synchronous;
no startup timer or initialization call is needed. Use a runtime and bundler
that support ESM and top-level await. Browser builds should output ESM and
target ES2022 or later. Importing only `brotli/decompress` does not load the
encoder.

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

Compresses the given buffer. Pass optional parameters as the second argument.

```javascript
import { readFileSync } from 'node:fs';
import { compress } from 'brotli';

// encode a buffer of binary data
compress(readFileSync('myfile.bin'));

// encode some data with options (default options shown)
compress(readFileSync('myfile.bin'), {
  mode: 0, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 11, // 0 - 11
  lgwin: 22, // window size
  dictionary: ''
});
```

## License

MIT
