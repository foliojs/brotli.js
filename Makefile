CPP = emcc
CPPFLAGS = -O3 -s TOTAL_MEMORY=318767104 -s NO_FILESYSTEM=1 -s NO_BROWSER=1 --closure 1 --llvm-lto 1 --pre-js enc/pre.js

COMMONDIR = vendor/brotli/common
ENCDIR = vendor/brotli/enc
ENCSRC = enc/encode.c $(wildcard $(COMMONDIR)/*.c) $(wildcard $(ENCDIR)/*.c)
ENCOBJ = $(ENCSRC:.c=.o)

all: build/encode.js

.c.o .cc.o:
	$(CPP) -I vendor/brotli/include -c $< -o $@
		
build/encode.js: enc/pre.js $(ENCOBJ)
	mkdir -p build/
	$(CPP) $(CPPFLAGS) -s EXPORTED_FUNCTIONS="['_encode']" -s EXPORTED_RUNTIME_METHODS="['malloc', 'free']" $(ENCOBJ) -o build/encode.js
	bro --input build/encode.js.mem | base64 | awk '{print "module.exports=\""$$1"\";"}' > build/mem.js
	rm build/encode.js.mem
	
clean:
	rm -rf $(ENCOBJ) build/
