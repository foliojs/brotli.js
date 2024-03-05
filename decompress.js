import brotliPromise from './build/brotli.js';

/**
 * Compresses the given buffer
 * The second parameter is optional and specifies whether the buffer is
 * text or binary data (the default is binary).
 * Returns null on error
 */
export const decompress = async function(buffer) {
  const brotli = await brotliPromise();
  // allocate input buffer and copy data to it
  var buf = brotli._malloc(buffer.length);
  brotli.HEAPU8.set(buffer, buf);

  // allocate output buffer (same size + some padding to be sure it fits), and encode
  var decodedSize = 0;
  var decodedSizePtr = brotli._malloc(Int32Array.BYTES_PER_ELEMENT);
  var outBuf = brotli._decompress(buf, buffer.length, decodedSizePtr);
  var decodedSize = brotli.getValue(decodedSizePtr, 'i32');

  var outBuffer = null;
  if (decodedSize !== -1) {
    // allocate and copy data to an output buffer
    outBuffer = new Uint8Array(decodedSize);
    outBuffer.set(brotli.HEAPU8.subarray(outBuf, outBuf + decodedSize));
  }

  // free malloc'd buffers
  brotli._free(buf);
  brotli._free(outBuf);

  return outBuffer;
};
