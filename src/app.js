// import config from './config';
// import * as models from './models';
//
// console.log('Application name: ', config.name);
// new models.Product();
// new models.User();
const path = require('path');
const Importer = require('./utils/importer');
const DirWatcher = require('./utils/dirwatcher');


const emitter = new DirWatcher();
const importer = new Importer(emitter);

emitter.watch(path.join(__dirname, 'data'), 3000);
