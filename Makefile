EMCC ?= $(if $(wildcard .emsdk/upstream/emscripten/emcc),.emsdk/upstream/emscripten/emcc,emcc)
CFLAGS ?= -O3
CPPFLAGS += -I vendor/brotli/c/include/
LDFLAGS += -s INITIAL_MEMORY=318767104 -s FILESYSTEM=0 --closure 1 \
	-s WASM=0 -s WASM_ASYNC_COMPILATION=0 \
	-s EXPORTED_FUNCTIONS="['_malloc', '_free', '_encodeWithDictionary']" \
	-s EXPORTED_RUNTIME_METHODS="['HEAPU8']"

COMMONDIR = vendor/brotli/c/common
ENCDIR = vendor/brotli/c/enc
ENCSRC = compress.c $(wildcard $(COMMONDIR)/*.c) $(wildcard $(ENCDIR)/*.c)
ENCOBJ = $(ENCSRC:.c=.o)

all: build/encode.js

.PHONY: all check-build-tools clean

check-build-tools:
	@command -v "$(EMCC)" >/dev/null 2>&1 || { \
		echo "Emscripten compiler not found: $(EMCC)" >&2; \
		echo "Install and activate emsdk; see 'Building from source' in readme.md." >&2; \
		exit 1; \
	}
	@test -f vendor/brotli/c/include/brotli/encode.h || { \
		echo "Brotli sources not found. Run: git submodule update --init --recursive" >&2; \
		exit 1; \
	}

$(ENCOBJ): | check-build-tools

.c.o .cc.o:
	$(EMCC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@

build/encode.js: $(ENCOBJ) Makefile | check-build-tools
	mkdir -p build/
	$(EMCC) $(CFLAGS) $(LDFLAGS) $(ENCOBJ) -o $@

clean:
	rm -rf $(ENCOBJ) build/
