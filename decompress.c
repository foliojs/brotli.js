#include <brotli/decode.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

size_t INITIAL_BUFFERS_SIZE = 1 << 8;
size_t BUFFER_SIZE = 1 << 16;

void leave(BrotliDecoderState* state, const uint8_t** buffers, size_t* buffers_sizes) {
  BrotliDecoderDestroyInstance(state);
  free(buffers);
  free(buffers_sizes);
}

uint8_t* decompress(const uint8_t input_buffer[BROTLI_ARRAY_PARAM(input_size)],
  size_t input_size, size_t* decompressed_size) {
  BrotliDecoderState* state = BrotliDecoderCreateInstance(NULL, NULL, NULL);
  if (!state) {
      return NULL;
  }

  const uint8_t** buffers = (const uint8_t**)malloc(INITIAL_BUFFERS_SIZE);
  size_t* buffers_sizes = (size_t*)malloc(INITIAL_BUFFERS_SIZE);
  size_t buffers_array_size = INITIAL_BUFFERS_SIZE;
  size_t buffers_num = 0;
  size_t previous_output_size = 0;

  BrotliDecoderResult result = BROTLI_DECODER_RESULT_ERROR;
  size_t available_in = input_size;
  size_t total_out = 0;
  const uint8_t* next_in = (const uint8_t*)input_buffer;
  while (result != BROTLI_DECODER_RESULT_SUCCESS) {
    result = BrotliDecoderDecompressStream(state, &available_in, &next_in, NULL, NULL, NULL);

    if (result == BROTLI_DECODER_RESULT_ERROR) {
      leave(state, buffers, buffers_sizes);
      return NULL;
    }
    size_t buffer_size = 0;
    const uint8_t* buffer = BrotliDecoderTakeOutput(state, &buffer_size);
    total_out += buffer_size;
    if (buffer_size > 0) {
      previous_output_size = total_out;

      buffers[buffers_num] = buffer;
      buffers_sizes[buffers_num] = buffer_size;
      ++buffers_num;
      if (buffers_num >= buffers_array_size) {
        buffers_array_size *= 2;
        buffers = (const uint8_t**)realloc(buffers, buffers_array_size);
        buffers_sizes = (size_t*)realloc(buffers_sizes, buffers_array_size);
        if (!buffers || !buffers_sizes) {
          leave(state, buffers, buffers_sizes);
          return NULL;
        }
      }
    }
    if (result == BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT) {
      leave(state, buffers, buffers_sizes);
      return NULL;
    }
  }
  uint8_t* decompressed_data = (uint8_t*)malloc(total_out);
  size_t current = 0;
  for (int i = 0; i < buffers_num; ++i) {
    memcpy(decompressed_data + current, buffers[i], buffers_sizes[i]);
    current += buffers_sizes[i];
  }
  
  *decompressed_size = total_out;

  leave(state, buffers, buffers_sizes);
  return decompressed_data;
}

