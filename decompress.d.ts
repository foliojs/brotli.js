/** Decompresses the input synchronously, computing the output size if omitted. */
export function decompress(
  buffer: ArrayLike<number>,
  outSize?: number | null
): Uint8Array;
