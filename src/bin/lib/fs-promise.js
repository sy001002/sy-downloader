const fs = require('fs');

const stat = path => new Promise((resolve, reject) => fs.stat(path, (err, stats) => {
   if( err )
      return reject(err);
   resolve(stats);
}));

const rename = (oldPath, newPath) => new Promise((resolve, reject) => {
   fs.rename(oldPath, newPath, () => {
      resolve();
   });
});

const unlink = path => new Promise(resolve => fs.unlink(path, resolve));

module.exports = {
   stat,
   rename,
   unlink
};
