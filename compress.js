import createEncoder from './build/encode.js';

let encoderPromise;

/**
 * Compresses the given buffer
 * The second parameter is optional and specifies whether the buffer is
 * text or binary data (the default is binary).
 * Returns a Promise of the compressed bytes, or null if encoding fails.
 * Initialization and runtime errors reject the Promise.
 */
export async function compress(buffer, opts) {
  // Cache failures as well as successful initialization, including synchronous throws.
  encoderPromise ??= Promise.resolve().then(() => createEncoder());
  const brotli = await encoderPromise;

  // default to binary data
  var quality = 11;
  var mode = 0;
  var lgwin = 22;
  var dictionary = "";

  if (typeof opts === 'boolean') {
    mode = opts ? 0 : 1;
  } else if (typeof opts === 'object') {
    quality = opts.quality ?? 11;
    mode = opts.mode ?? 0;
    lgwin = opts.lgwin ?? 22;
    dictionary = opts.dictionary ?? "";
  }

  // allocate input buffer and copy data to it
  var buf = brotli._malloc(buffer.length);
  brotli.HEAPU8.set(buffer, buf);

  // allocate dictionary buffer and copy data to it
  var dict = brotli._malloc(dictionary.length);
  brotli.HEAPU8.set(dictionary, dict);
  // allocate output buffer and encode. Incompressible input grows by a few
  // header bytes per block (about 3 bytes per KiB at quality 0-1 with
  // lgwin 10), so leave room for twice that plus some padding.
  var outSize = buffer.length + (buffer.length >> 7) + 1024;
  var outBuf = brotli._malloc(outSize);
  var encodedSize = brotli._encodeWithDictionary(quality, lgwin, mode, buffer.length, buf, dictionary.length, dict, outSize, outBuf);

  // the encoder returns 0 on failure (a valid stream is never empty)
  var outBuffer = null;
  if (encodedSize > 0) {
    // allocate and copy data to an output buffer
    outBuffer = new Uint8Array(encodedSize);
    outBuffer.set(brotli.HEAPU8.subarray(outBuf, outBuf + encodedSize));
  }

  // free malloc'd buffers
  brotli._free(buf);
  brotli._free(dict);
  brotli._free(outBuf);

  return outBuffer;
}
