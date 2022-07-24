const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.string = '';
  }

  _transform(chunk, encoding, callback) {
    const stringFromChunk = chunk.toString();
    this.string += stringFromChunk;
    const split = this.string.split(os.EOL);
    this.string = split.pop();

    for (let i = 0; i < split.length; i++) {
      this.push(split[i]);
    }

    callback();
  }

  _flush(callback) {
    this.push(this.string);
    callback();
  }
}

module.exports = LineSplitStream;
