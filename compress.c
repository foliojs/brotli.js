#include <emscripten.h>
#include <assert.h>
#include <stdio.h>
#include <string.h>

#include <brotli/encode.h>

EMSCRIPTEN_KEEPALIVE
size_t encodeWithDictionary(
    int quality, int lgwin, BrotliEncoderMode mode, size_t input_size,
    const uint8_t input_buffer[BROTLI_ARRAY_PARAM(input_size)],
    size_t encoded_size,
    uint8_t encoded_buffer[BROTLI_ARRAY_PARAM(encoded_size)]) {
  BrotliEncoderState* state =
      BrotliEncoderCreateInstance(NULL, NULL, NULL);
  if (state == NULL) {
    return 0;
  }
  if (quality != BROTLI_DEFAULT_QUALITY &&
      !BrotliEncoderSetParameter(state, BROTLI_PARAM_QUALITY, quality)) {
    BrotliEncoderDestroyInstance(state);
    return 0;
  }
  if (lgwin != BROTLI_DEFAULT_WINDOW &&
      !BrotliEncoderSetParameter(state, BROTLI_PARAM_LGWIN, lgwin)) {
    BrotliEncoderDestroyInstance(state);
    return 0;
  }
  if (!BrotliEncoderSetParameter(state, BROTLI_PARAM_SIZE_HINT,
                                 input_size)) {
    BrotliEncoderDestroyInstance(state);
    return 0;
  }
  if (!input_size) {
    BrotliEncoderDestroyInstance(state);
    return 0;
  }
  if (!encoded_size) {
    BrotliEncoderDestroyInstance(state);
    return 0;
  }
  size_t available_in, available_out = 0, bytes_written = 0;
  BROTLI_BOOL result = BROTLI_TRUE;
  result = BrotliEncoderCompressStream(
    state, BROTLI_OPERATION_PROCESS, &input_size, &input_buffer,
    &available_out, NULL, NULL);
  size_t initial_buffer_size = 0;
  size_t output_buffer_size = 0;
  const uint8_t* buffer = BrotliEncoderTakeOutput(state, &initial_buffer_size);
  fprintf(stderr, "initial %zu encoded %zu\n", initial_buffer_size, encoded_size);
  assert(initial_buffer_size <= encoded_size);
  memcpy(encoded_buffer, buffer, initial_buffer_size);
  output_buffer_size += initial_buffer_size;
  while (result && !BrotliEncoderIsFinished(state)) {
    available_in = 0;
    const uint8_t* next_in = NULL;
    result = BrotliEncoderCompressStream(
        state, BROTLI_OPERATION_FINISH, &available_in, &next_in,
        &available_out, NULL, NULL);
    size_t buffer_size = 0;
    const uint8_t* buffer = BrotliEncoderTakeOutput(state, &buffer_size);
    fprintf(stderr, "buffer %zu encoded %zu\n", buffer_size, encoded_size);
    assert(output_buffer_size + buffer_size <= encoded_size);
    memcpy(encoded_buffer + initial_buffer_size, buffer, buffer_size);
    output_buffer_size += buffer_size;
  }
  BrotliEncoderDestroyInstance(state);
  // Keeping all data in a buffer until the input stream is exhausted is
  // infeasible, so some data may have emitted when the error is reported.
  // Unfortunately, the Compressor API can not report error at this stage,
  // so live with a CHECK. Fortunately, an error is not expected: usually
  // OOM or a programming error.
  assert(result);
  return output_buffer_size;
}
