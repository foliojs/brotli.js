# Brotli.js

Brotli.js is port of the [Brotli](http://tools.ietf.org/html/draft-alakuijala-brotli-01) compression algorithm (as used in the [WOFF2](http://www.w3.org/TR/WOFF2/) font format) to JavaScript. The decompressor is hand ported, and the compressor is ported
with Emscripten.  The original C++ source code can be found [here](http://github.com/google/brotli).

## Installation and usage

Install using npm.

    npm install brotli

If you want to use brotli in the browser, you should use [Browserify](http://browserify.org/) to build it.

In node, or in browserify, you can load brotli in the standard way:

```javascript
var brotli = require('brotli');
```

You can also require just the `decompress` function or just the `compress` function, which is useful for browserify builds.
For example, here's how you'd require just the `decompress` function.

```javascript
var decompress = require('brotli/decompress');
```

## API

### brotli.decompress(buffer, [outSize])

Decompresses the given buffer to produce the original input to the compressor.
The `outSize` parameter is optional, and will be computed by the decompressor
if not provided. Inside a WOFF2 file, this can be computed from the WOFF2 directory.

```javascript
// decode a buffer where the output size is known
brotli.decompress(compressedData, uncompressedLength);

// decode a buffer where the output size is not known
brotli.decompress(fs.readFileSync('compressed.bin'));
```

### brotli.compress(buffer, isText = false)

Compresses the given buffer.  Pass `true` as the second argument if the input
buffer is text data.  Pass `false` or nothing if it is binary.  This function
is known to be quite slow.

```javascript
// encode a buffer of binary data
brotli.compress(fs.readFileSync('myfile.bin'));

// encode some text data
brotli.compress(fs.readFileSync('myfile.bin'), true);
```

## License

MIT
