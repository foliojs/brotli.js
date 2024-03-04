CPP = emcc
CPPFLAGS = -O3 -s TOTAL_MEMORY=318767104 -s NO_FILESYSTEM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s 'EXPORT_NAME="brotli"' -s "EXPORTED_RUNTIME_METHODS=['getValue']" --closure 1

COMMONDIR = vendor/brotli/c/common
ENCDIR = vendor/brotli/c/enc
DECDIR = vendor/brotli/c/dec
ENCSRC = compress.c decompress.c $(wildcard $(COMMONDIR)/*.c) $(wildcard $(ENCDIR)/*.c) $(wildcard $(DECDIR)/*.c)
ENCOBJ = $(ENCSRC:.c=.o)

all: build/brotli.js

.c.o .cc.o:
	$(CPP) -I vendor/brotli/c/include/ -c $< -o $@

build/brotli.js: $(ENCOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_encodeWithDictionary', '_decompress']" $(ENCOBJ) -o build/brotli.js

clean:
	rm -rf $(ENCOBJ) build/
