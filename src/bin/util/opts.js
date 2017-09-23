const DECODERS = require('../lib/decoders');

const ARGV_MAP = {
   '-u': 'url',
   '--url': 'url',
   '-t': 'type',
   '--type': 'type',
   '-cp': 'continuePath',
   '--continue-path': 'continuePath',
   '-d': 'dirname',
   '--dirname': 'dirname',
   '-tm': 'timeout',
   '--timeout': 'timeout',
   '-r': 'retry',
   '--retry': 'retry',
   '-rd': 'retryDelay',
   '--retry-delay': 'retryDelay',
   '-pd': 'progressDelay',
   '--progress-delay': 'progressDelay'
};

const DEFAULT_OPTS = {
   timeout: 30000,
   retry: 5,
   retryDelay: 5000,
   progressDelay: 500
};

function fixOpts(opts) {
   if( !opts.url )
      return 'url';

   if( !DECODERS[opts.type] )
      return 'type';

   if((!opts.continuePath && !opts.dirname) || (opts.continuePath && opts.dirname))
      return 'path';

   opts.timeout = parseInt(opts.timeout);
   if( opts.timeout < 0 || isNaN(opts.timeout) )
      opts.timeout = DEFAULT_OPTS.timeout;

   opts.retry = parseInt(opts.retry);
   if( opts.retry < 1 || isNaN(opts.retry) )
      opts.retry = DEFAULT_OPTS.retry;

   opts.retryDelay = parseInt(opts.retryDelay);
   if( opts.retryDelay < 0 || isNaN(opts.retryDelay) )
      opts.retryDelay = DEFAULT_OPTS.retryDelay;

   opts.progressDelay = parseInt(opts.progressDelay);
   if( opts.progressDelay < 0 || isNaN(opts.progressDelay) )
      opts.progressDelay = DEFAULT_OPTS.progressDelay;
}

function getOpts() {
   const opts = {...DEFAULT_OPTS};

   for(let i = 2; i < process.argv.length; i++) {
      const currA = process.argv[i];
      const key = ARGV_MAP[currA];

      if( !key )
         return;

      i += 1;
      opts[key] = process.argv[i];
   }

   const vErr = fixOpts(opts);

   if( vErr )
      return vErr;
   else
      return opts;
}

module.exports = {
   getOpts
};
