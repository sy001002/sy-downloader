module.exports = (timeout, rejectReason) => new Promise((resolve, reject) => {
   setTimeout(() => {
      if( rejectReason )
         return reject(rejectReason);
      resolve();
   }, timeout);
});
