/**
 * Compresses the given buffer
 * The second parameter is optional and specifies whether the buffer is
 * text or binary data (the default is binary).
 * Returns null on error
 */
module.exports = function(buffer, isText) {
  // default to binary data
  var mode = isText ? 0 : 1;
  
  // allocate input buffer and copy data to it
  var buf = this._malloc(buffer.length);
  this.HEAPU8.set(buffer, buf);
  
  // allocate output buffer (same size + some padding to be sure it fits), and encode
  var outBuf = this._malloc(buffer.length + 1024);
  var encodedSize = this._encode(mode, buffer.length, buf, buffer.length, outBuf);
  
  var outBuffer = null;
  if (encodedSize !== -1) {
    // allocate and copy data to an output buffer
    outBuffer = new Uint8Array(encodedSize);
    outBuffer.set(this.HEAPU8.subarray(outBuf, outBuf + encodedSize));
  }
  
  // free malloc'd buffers
  this._free(buf);
  this._free(outBuf);
    
  return outBuffer;
};
