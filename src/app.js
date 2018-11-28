import config from './config';
import * as models from './models';

console.log('Application name: ', config.name);
new models.Product();
new models.User();
