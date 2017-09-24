const SyDownloader = require('./lib/sy-downloader');

module.exports = opts => {
   return new SyDownloader(opts);
};
