import base64 from 'base64-js';
import { decompress } from './decode.js';
import dictionaryData from './dictionary.bin.js';

/**
 * The normal dictionary-data.js is quite large, which makes it 
 * unsuitable for browser usage. In order to make it smaller, 
 * we read dictionary.bin, which is a compressed version of
 * the dictionary, and on initial load, Brotli decompresses 
 * it's own dictionary. 😜
 */
export function init() {
  var compressed = base64.toByteArray(dictionaryData);
  return decompress(compressed);
}
