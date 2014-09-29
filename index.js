var brotli = require('./brotli');

/**
 * Compresses the given buffer
 * The second parameter is optional and specifies whether the buffer is
 * text or binary data (the default is binary).
 * Returns null on error
 */
exports.compress = function(buffer, isText) {
  // default to binary data
  var mode = isText ? 0 : 1;
  
  // allocate input buffer and copy data to it
  var buf = brotli._malloc(buffer.length);
  brotli.HEAPU8.set(buffer, buf);
  
  // allocate output buffer (same size + some padding to be sure it fits), and encode
  var outBuf = brotli._malloc(buffer.length + 1024);
  var encodedSize = brotli._encode(mode, buffer.length, buf, buffer.length, outBuf);
  
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
};

/**
 * Decompresses the given buffer
 * If outSize is given, it is used as the output buffer size,
 * otherwise the size must be guessed.
 * Returns null on error or if the output buffer wasn't big enough
 */
exports.decompress = function(buffer, outSize) {
  // If no output size was given, guess one
  if (!outSize)
    outSize = 4 * buffer.length;
  
  // allocate input buffer and copy data to it
  var buf = brotli._malloc(buffer.length);
  brotli.HEAPU8.set(buffer, buf);
    
  // allocate output buffer, and decode
  var outBuf = brotli._malloc(outSize);
  var decodedSize = brotli._decode(buffer.length, buf, outSize, outBuf);
  
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
