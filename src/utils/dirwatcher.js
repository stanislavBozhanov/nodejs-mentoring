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
  getFileHash(filename, callback) {
    const hash = crypto.createHash('sha256');
    fs.readFile(filename, function(err, data) {
      if (err)
        return callback(err);

      hash.update(data);
      callback(null, hash.digest('hex'));
    });
  }

  // Sets this.files
  setFileHashes(path, callback) {
    const self = this;
    fs.readdir(path, function (err, files) {
      if (err)
        console.log(err);


      let count = files.length;
      files.forEach(file => {
        self.getFileHash(p.join(path, file), function(err, data) {
          if (err)
            console.log(err);

          self.files[file] = data;
          count--;
          if (!count)
            callback();
        });
      });
    })
  }

  watch(path, delay) {
    const self = this;
    self.setFileHashes(path, function(err) {
      if (err)
        console.log(err);

      setInterval(() => {
        fs.readdir(path, function(err, files) {
          files.forEach(file => {
            self.getFileHash(p.join(path, file), function(err, hash) {
              if (self.files[file] !== hash) {
                self.emit('changed');
                console.log('changed');
                self.files[file] = hash;
              }
            })
          })
        })
      }, delay)
    });
  }
}

// const dirw = new DirWatcher();
// dirw.watch('../data', 5000);

module.exports = DirWatcher;
