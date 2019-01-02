const EventEmitter = require('events');
const fs = require('fs');
const crypto = require('crypto');
const p = require('path');


class DirWatcher extends EventEmitter {
  constructor() {
    super();
    this.files = {};
  }

  // Takes absolute path and returns hash string
  getFileHash(filename) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filename);
    hash.update(data);
    return hash.digest('hex');
  }

  // Sets this.files
  setFileHashes(path) {
    fs.readdirSync(path).forEach(file => this.files[file] = this.getFileHash(p.join(path, file)))
  }

  watch(path, delay) {
    this.setFileHashes(path);
    setInterval(() => {
      fs.readdirSync(path).forEach(file => {
        let hash = this.getFileHash(p.join(path, file));
        if (this.files[file] !== hash) {
          this.emit('changed');
          console.log('changed');
          this.files[file] = hash;
        }
      })
    }, delay)
  }
}

// const dirw = new DirWatcher();
// dirw.watch('../data', 5000);

module.exports = DirWatcher;
