#include <brotli/encode.h>

int encode(int quality, int lgwin, int mode,
           size_t input_size, const uint8_t* input_buffer,
           size_t encoded_size, uint8_t* encoded_buffer) {
  if (BrotliEncoderCompress(quality, lgwin, (BrotliEncoderMode) mode, 
                            input_size, input_buffer, &encoded_size, encoded_buffer)) {
    return encoded_size;
  }
  
  return -1;
}
