#include <emscripten.h>
#include <assert.h>
#include <stdio.h>
#include <string.h>

#include <brotli/encode.h>

// Use the brotli streaming API in order to encode the input.
// Based on a code snippet from @eustas
EMSCRIPTEN_KEEPALIVE
size_t encodeWithDictionary(
    int quality, int lgwin, BrotliEncoderMode mode, size_t input_size,
    const uint8_t input_buffer[BROTLI_ARRAY_PARAM(input_size)],
    size_t dictionary_size,
    const uint8_t dictionary_buffer[BROTLI_ARRAY_PARAM(dictionary_size)],
    size_t encoded_size,
    uint8_t encoded_buffer[BROTLI_ARRAY_PARAM(encoded_size)]) {
  // Returns the number of bytes written to encoded_buffer, or 0 on error.
  // A valid Brotli stream is never empty, so 0 is never a valid result.
  size_t result = 0;
  size_t output_size = 0;
  size_t available_in = input_size;
  const uint8_t* next_in = input_buffer;
  BrotliEncoderPreparedDictionary* prepared = NULL;
  BrotliEncoderState* state =
      BrotliEncoderCreateInstance(NULL, NULL, NULL);
  if (state == NULL) {
    return 0;
  }
  if (quality != BROTLI_DEFAULT_QUALITY &&
      !BrotliEncoderSetParameter(state, BROTLI_PARAM_QUALITY, quality)) {
    goto cleanup;
  }
  if (lgwin != BROTLI_DEFAULT_WINDOW &&
      !BrotliEncoderSetParameter(state, BROTLI_PARAM_LGWIN, lgwin)) {
    goto cleanup;
  }
  if (!BrotliEncoderSetParameter(state, BROTLI_PARAM_SIZE_HINT,
                                 input_size)) {
    goto cleanup;
  }
  if (dictionary_size) {
    prepared = BrotliEncoderPrepareDictionary(
        BROTLI_SHARED_DICTIONARY_RAW, dictionary_size,
        dictionary_buffer, quality, NULL, NULL, NULL);
    if (!prepared) {
      goto cleanup;
    }
    if (!BrotliEncoderAttachPreparedDictionary(state, prepared)) {
      goto cleanup;
    }
  }

  // The encoder may return before it has consumed all input or written all
  // output, so keep calling it until the stream is finished (see the loop
  // contract of BrotliEncoderCompressStream in encode.h).
  while (!BrotliEncoderIsFinished(state)) {
    size_t available_out = 0;
    if (!BrotliEncoderCompressStream(
            state, BROTLI_OPERATION_FINISH, &available_in, &next_in,
            &available_out, NULL, NULL)) {
      goto cleanup;
    }
    size_t buffer_size = 0;
    const uint8_t* buffer = BrotliEncoderTakeOutput(state, &buffer_size);
    if (buffer_size > encoded_size - output_size) {
      goto cleanup;
    }
    memcpy(encoded_buffer + output_size, buffer, buffer_size);
    output_size += buffer_size;
  }

  result = output_size;

cleanup:
  // The encoder uses the prepared dictionary, so destroy it first.
  BrotliEncoderDestroyInstance(state);
  BrotliEncoderDestroyPreparedDictionary(prepared);
  return result;
}
