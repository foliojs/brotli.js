export class BrotliInput {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
  }
  read(buf, i, count) {
    if (this.pos + count > this.buffer.length) {
      count = this.buffer.length - this.pos;
    }

    for (var p = 0; p < count; p++)
      buf[i + p] = this.buffer[this.pos + p];

    this.pos += count;
    return count;
  }
}


export class BrotliOutput {
  constructor(buf) {
    this.buffer = buf;
    this.pos = 0;
  }
  write(buf, count) {
    if (this.pos + count > this.buffer.length)
      throw new Error('Output buffer is not large enough');

    this.buffer.set(buf.subarray(0, count), this.pos);
    this.pos += count;
    return count;
  }
}


