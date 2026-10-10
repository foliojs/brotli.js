export interface CompressOptions {
  /** Compression mode: 0 = generic, 1 = text, 2 = font. Defaults to 0. */
  mode?: 0 | 1 | 2;
  /** Compression quality, from 0 to 11. Defaults to 11. */
  quality?: number;
  /** Base-2 logarithm of the window size. Defaults to 22. */
  lgwin?: number;
  /** Optional custom dictionary. */
  dictionary?: ArrayLike<number> | string;
}

/**
 * Compresses the input, resolving to null if encoding fails.
 * Initialization and runtime errors reject the Promise.
 */
export function compress(
  buffer: ArrayLike<number> | string,
  options?: CompressOptions | boolean
): Promise<Uint8Array | null>;
