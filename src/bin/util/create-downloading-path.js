const path = require('path');
const fsPromise = require('../lib/fs-promise');

const POST_FIX = 'sydownload';

module.exports = async function(dirname, filename) {
   let count = 0;

   while(1) {
      const tmpFilename = count ?
         `${filename}.v${count}.${POST_FIX}` :
         `${filename}.${POST_FIX}`;
      const tmpPath = path.resolve(dirname, tmpFilename);

      try {
         await fsPromise.stat(tmpPath);
         count += 1;
      } catch(err) {
         return tmpPath;
      }
   }
};
