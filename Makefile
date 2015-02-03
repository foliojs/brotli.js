DECDIR=vendor/brotli/dec
ENCDIR=vendor/brotli/enc

CPP = emcc
CPPFLAGS = -O3 -s TOTAL_MEMORY=318767104 -s NO_FILESYSTEM=1 -s NO_BROWSER=1 --memory-init-file 0 --closure 1 -s EXPORTED_FUNCTIONS="['_decodedSize', '_decode', '_encode']"

DECSRC = $(wildcard $(DECDIR)/*.c)
ENCSRC = index.cc $(wildcard $(ENCDIR)/*.cc)
DECOBJ = $(DECSRC:.c=.o)
ENCOBJ = $(ENCSRC:.cc=.o)

.c.o .cc.o:
	$(CPP) -c $< -o $@

all: $(DECOBJ) $(ENCOBJ)
	$(CPP) $(CPPFLAGS) $^ -o brotli.js
	echo "module.exports = Module" >> brotli.js

clean:
	rm -f $(DECOBJ) $(ENCOBJ)