# Changelog

## Unreleased

### Changed

- **Breaking:** Converted the package to ESM only. The package root provides
  named `compress` and `decompress` exports with no default export. CommonJS
  `require()` is no longer supported; CommonJS callers can use dynamic `import()`.
- Public entry points are limited to the package root, `brotli/compress`, and
  `brotli/decompress`, including `.js` aliases for both standalone modules.
  Standalone modules default-export their function.
- The encoder initializes once using top-level await during module loading.
  Both functions remain synchronous after import. Runtimes and bundlers must
  support ESM and top-level await; browser bundles should target ES2022 or later.

### Added

- Tests for ESM exports, immediate encoder readiness, CommonJS rejection, and
  browser bundles, including dictionary initialization and decompression without
  the encoder.

### Migration

```javascript
import { compress, decompress } from 'brotli';
```

To load either function independently:

```javascript
import compress from 'brotli/compress';
import decompress from 'brotli/decompress';
```
