DECDIR=vendor/brotli/dec
ENCDIR=vendor/brotli/enc

CPP = emcc
CPPFLAGS = -O3 -s TOTAL_MEMORY=318767104 -s NO_FILESYSTEM=1 -s NO_BROWSER=1 --closure 1 --pre-js src/pre.js

DECSRC = src/decode.c $(wildcard $(DECDIR)/*.c)
ENCSRC = src/encode.cc $(wildcard $(ENCDIR)/*.cc)
DECOBJ = $(DECSRC:.c=.o)
ENCOBJ = $(ENCSRC:.cc=.o)

all: build/decode.js build/encode.js build/all.js

.c.o .cc.o:
	$(CPP) -I vendor/ -c $< -o $@
	
build/decode.js: src/pre.js $(DECOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_decode']" $(DECOBJ) -o build/decode.js
	gzip -f9 build/decode.js.mem
	
build/encode.js: src/pre.js $(ENCOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_encode']" $(ENCOBJ) -o build/encode.js
	gzip -f9 build/encode.js.mem
	
build/all.js: src/pre.js $(DECOBJ) $(ENCOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_decode', '_encode']" $(DECOBJ) $(ENCOBJ) -o build/all.js
	gzip -f9 build/all.js.mem

clean:
	rm -rf $(DECOBJ) $(ENCOBJ) build/
