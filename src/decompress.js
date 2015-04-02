/**
 * Decompresses the given buffer
 * If outSize is given, it is used as the output buffer size,
 * otherwise the size must be guessed.
 * Returns null on error or if the output buffer wasn't big enough
 */
module.exports = function(buffer, outSize) {
  // If no output size was given, guess one
  if (!outSize)
    outSize = 4 * buffer.length;
  
  // allocate input buffer and copy data to it
  var buf = this._malloc(buffer.length);
  this.HEAPU8.set(buffer, buf);
    
  // allocate output buffer, and decode
  var outBuf = this._malloc(outSize);
  var decodedSize = this._decode(buffer.length, buf, outSize, outBuf);
  
  var outBuffer = null;
  if (decodedSize !== -1) {
    // allocate and copy data to an output buffer
    outBuffer = new Uint8Array(decodedSize);
    outBuffer.set(this.HEAPU8.subarray(outBuf, outBuf + decodedSize));
  }
  
  // free malloc'd buffers
  this._free(buf);
  this._free(outBuf);
  
  return outBuffer;
};
