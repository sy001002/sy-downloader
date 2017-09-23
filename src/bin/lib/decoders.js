module.exports = {
   'google-drive': {
      decoder: require('google-drive-decoder'),
      protocol: 'https'
   },
   'zippyshare': {
      decoder: require('zippyshare-decoder'),
      protocol: 'http'
   }
};
