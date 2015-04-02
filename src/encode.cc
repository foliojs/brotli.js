#include <brotli/enc/encode.h>

extern "C" {
  int encode(int mode,
             size_t input_size,
             const uint8_t* input_buffer,
             size_t encoded_size,
             uint8_t* encoded_buffer) {
    brotli::BrotliParams params;
    params.mode = (brotli::BrotliParams::Mode) mode;
    if (brotli::BrotliCompressBuffer(params, input_size, input_buffer, &encoded_size, encoded_buffer))
      return encoded_size;
    
    return -1;
  }
}
