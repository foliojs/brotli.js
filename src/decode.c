#include <brotli/dec/decode.h>

int decode(size_t encoded_size,
           const uint8_t* encoded_buffer,
           size_t decoded_size,
           uint8_t* decoded_buffer) {
  if (BrotliDecompressBuffer(encoded_size, encoded_buffer, &decoded_size, decoded_buffer))
    return decoded_size;
  
  return -1;
}
