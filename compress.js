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
    quality = opts.quality || 11;
    mode = opts.mode || 0;
    lgwin = opts.lgwin || 22;
    dictionary = opts.dictionary || "";
  }

  // allocate input buffer and copy data to it
  var buf = brotli._malloc(buffer.length);
  brotli.HEAPU8.set(buffer, buf);

  // allocate dictionary buffer and copy data to it
  var dict = brotli._malloc(dictionary.length);
  brotli.HEAPU8.set(dictionary, dict);
  // allocate output buffer (same size + some padding to be sure it fits), and encode
  var outBuf = brotli._malloc(buffer.length + 1024);
  var encodedSize = brotli._encodeWithDictionary(quality, lgwin, mode, buffer.length, buf, dictionary.length, dict, buffer.length + 1024, outBuf);

  var outBuffer = null;
  if (encodedSize !== -1) {
    // allocate and copy data to an output buffer
    outBuffer = new Uint8Array(encodedSize);
    outBuffer.set(brotli.HEAPU8.subarray(outBuf, outBuf + encodedSize));
  }

  // free malloc'd buffers
  brotli._free(buf);
  brotli._free(outBuf);

  return outBuffer;
}
