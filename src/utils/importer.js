const csv = require('csvtojson/v2');
const fs = require('fs');
const p = require('path');
const dataPath = p.join(__dirname, '../data');

class Importer {
  constructor(emitter) {
    emitter.on('changed', () => this.importFiles(dataPath))
  }

  importFiles(path) {
    fs.readdir(path, (err, files) => {
      files.forEach(file => {
        csv()
          .fromFile(p.join(path, file))
          .then(jsonObj => console.log(jsonObj))
      })
    })
  }

  importFilesSync(path) {
    const promises = [];
    fs.readdirSync(path).forEach(file => {
      promises.push(new Promise((resolve, reject) => {
        csv()
          .fromFile(p.join(path, file))
          .on('json', converted => console.log(converted))
          .on('done', error => {
            if (error) {
              reject(error);
            }
            resolve('done');
          })
      }));
      Promise.all(promises).then(() => console.log('done'));
    });
  }
}

module.exports = Importer;
