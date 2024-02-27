CPP = emcc
CPPFLAGS = -O3 -s TOTAL_MEMORY=318767104 -s NO_FILESYSTEM=1 --closure 1 --pre-js enc/pre.js

COMMONDIR = vendor/brotli/c/common
ENCDIR = vendor/brotli/c/enc
ENCSRC = compress.c enc/encode.c $(wildcard $(COMMONDIR)/*.c) $(wildcard $(ENCDIR)/*.c)
ENCOBJ = $(ENCSRC:.c=.o)

all: build/encode.js

.c.o .cc.o:
	$(CPP) -I vendor/brotli/c/include/ -c $< -o $@
		
build/encode.js: enc/pre.js $(ENCOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_encode', '_malloc', '_free', '_encodeWithDictionary']" $(ENCOBJ) -o build/encode.js
	
clean:
	rm -rf $(ENCOBJ) build/
