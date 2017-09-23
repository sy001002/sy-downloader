const crypto = require('crypto');

const randomByte = size => new Promise((resolve, reject) => crypto.randomBytes(size, (err, buf) => {
   if( err )
      return reject(err);
   resolve(buf);
}));

module.exports = async function(size) {
   while(1) {
      try {
         const buf = await randomByte(size);
         return buf.toString('hex');
      } catch(err) {}
   }
};
