const path = require('path');

module.exports = _path => {
   return path.resolve(process.cwd(), _path);
};
