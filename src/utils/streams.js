const fs = require('fs');
const through2 = require('through2');
const program = require('commander');
const Readable = require('stream').Readable;
const csv = require('csvtojson/v2');
const p = require('path');


function reverse(str) {
  return str.split('').reverse().join('');
}

function transform(str) {
  // By default streams process Buffer or String
  const stream = new Readable();
  stream._read = () => {};
  stream.push(str);
  stream.pipe(through2(function (chunk, enc, callback) {
    for (let i = 0; i < chunk.length; i++)
      if (chunk[i] >= 97 && chunk[i] <= 122)
        chunk[i] = chunk[i] - 32;
    this.push(chunk);
  }));
  stream.pipe(process.stdout);
}

function outputFile(filePath) {
  const stream = fs.createReadStream(filePath);
  stream.on('error', function(error) {
    console.log('Error:', error.message);
  });
  stream.pipe(process.stdout)
}

function convertFromFile(filePath) {
  if (!filePath.endsWith('.csv')) {
    console.log('Invalid file. Please provide csv file.');
    return;
  }
  const stream = fs.createReadStream(filePath);
  stream.on('error', function(error) {
    console.log('Error:', error.message);
  });
  csv()
    .fromStream(stream)
    .then(jsonObj => console.log(jsonObj))
}

function convertToFile(filePath) {
  if (!filePath.endsWith('.csv')) {
    console.log('Invalid file. Please provide csv file.');
    return;
  }
  const fileName = filePath.split('.')[0];
  const streamRead = fs.createReadStream(filePath);
  const streamWrite = fs.createWriteStream(`${fileName}.json`);
  streamRead.on('error', function(error) {
    console.log('Error:', error.message);
  });

  csv()
    .fromStream(streamRead)
    .then(jsonObj => streamWrite.write(JSON.stringify(jsonObj)))
}

function cssBundler(dirPath) {
  const streamWrite = fs.createWriteStream('bundle.css');
  fs.readdir(dirPath, function(err, fileList) {
    if (err) {
      console.log('Error: ', err);
      return;
    }
    for (let file of fileList) {
      let streamRead = fs.createReadStream(p.join(dirPath, file));
      streamRead.pipe(streamWrite);
    }
  })
}

program
  .option('-a, --actionS [type]', 'Select a function.')
  .option('-f, --fileS [filePath]', 'Enter file path.')
  .option('-p, --path [dirPath]', 'Bundle css')
  .option('-x, --helpS', 'Help menu')
  .parse(process.argv);


if (program.helpS) {
  const firstArgument = process.argv.slice(2)[0];
  if(!firstArgument.startsWith('-x') && !firstArgument.startsWith('--helpS')) {
    console.log('');
  } else {
    console.log('Usage: streams [options]\n' +
      '\n' +
      'Options:\n' +
      '  -a, --actionS [type]    Select a function.\n' +
      '  -f, --fileS [filePath]  Enter file path.\n' +
      '  -x, --helpS             Help menu\n' +
      '  -h, --help              output usage information\n');
  }
}

if (program.actionS) {
  switch (program.actionS) {
    case 'reverse':
      if (program.args.length > 0)
        reverse(program.args[0]);
      else
        console.log('String argument not supplied');
      break;
    case 'transform':
      if (program.args.length > 0)
        transform(program.args[0]);
      else
        console.log('String argument not supplied');
      break;
    case 'outputFile':
      if (program.fileS)
        outputFile(program.fileS);
      else
        console.log('File path argument not supplied');
      break;
    case 'convertFromFile':
      if (program.fileS)
        convertFromFile(program.fileS);
      else
        console.log('File path argument not supplied');
      break;
    case 'convertToFile':
      if (program.fileS)
        convertToFile(program.fileS);
      else
        console.log('File path argument not supplied');
      break;
    case 'cssBundler':
      if (program.path) {
        console.log(program);
        cssBundler(program.path);
      }
      else {
        console.log('Dir path argument not supplied');
      }
      break;
    default:
      console.log('Incorrect action:', program.actionS);
  }
}
