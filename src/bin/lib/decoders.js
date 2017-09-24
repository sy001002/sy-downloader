module.exports = {
   'google-drive': {
      decoder: require('google-drive-decoder'),
      protocol: 'https',
      tester: () => /^https:\/\/drive\.google\.com[\/\?]/
   },
   'zippyshare': {
      decoder: require('zippyshare-decoder'),
      protocol: 'http',
      tester: () => /^http:\/\/www[0-9]*\.zippyshare\.com[\/\?]/
   }
};
