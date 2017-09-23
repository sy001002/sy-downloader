const Path = require('path');
const fs = require('fs');
const { URL } = require('url');
const fsPromise = require('./lib/fs-promise');
const Opts = require('./util/opts');
const normalizePath = require('./util/normalize-path');
const DECODERS = require('./lib/decoders');
const createDownloadingPath = require('./util/create-downloading-path');
const delay = require('./util/delay');


const PROTOCOLS = {
   'http': require('http'),
   'https': require('https')
};

let currSize = 0;
let downloadDest;
let realFilePath;
let onDataTimeout = 0;
let progressDelay;
let contentLength;

function send(msg) {
   if( process.send )
      process.send(msg);
}

function onData(chunk) {
   currSize += chunk.length;
   if( Date.now() >= onDataTimeout ) {
      const msg = {
         type: 'process',
         size: currSize
      };

      if( contentLength )
         msg.total = contentLength;

      send(msg);
      console.log('progress:');
      console.log(`\tcurr:\t${currSize} Bytes`);
      if( contentLength )
         console.log(`\ttotal:\t${contentLength} Bytes`);

      onDataTimeout = Date.now() + progressDelay;
   }
}

async function onEnd() {
   let count = 0;
   let filePath = realFilePath;

   while(1) {
      if( count ) {
         const dirname = Path.dirname(realFilePath);
         const extname = Path.extname(realFilePath);
         const basename = Path.basename(realFilePath, extname);
         const newName = `${basename} (${count})${extname}`;
         filePath = Path.resolve(dirname, newName);
      }

      try {
         await fsPromise.stat(filePath);
         await delay(500);
         count += 1;
         continue;
      } catch(err) {
         await fsPromise.rename(downloadDest.path, filePath);
         console.log(`${filePath} download complete`);
         return process.exit(0);
      }
   }
}

function onError(err) {
   console.error('download error');
   process.exit(8);
}

const request = (protocol, opts) => new Promise((resolve, reject) => {
   protocol.get(opts, res => {
      if( res.statusCode < 200 || res.statusCode >= 400 ) {
         res.destroy();
         return reject('!ok');
      }

      const contentDisposition = res.headers['content-disposition'] || '';

      if( contentDisposition.indexOf('attachment') < 0 ) {
         res.destroy();
         return reject('server fucked');
      }

      if(currSize && res.statusCode !== 206) {
         res.destroy();
         return reject('not 206');
      }

      contentLength = parseInt(res.headers['content-length']) + currSize;
      res.pipe(downloadDest);

      res.on('data', onData);
      res.on('end', onEnd);

      resolve();
   }).on('error', onError);
});

async function start(opts) {
   let msg;

   for(let i = 0; i < opts.retry; i++) {
      try {
         const downloadInfo = await DECODERS[opts.type].decoder(opts.url, opts.timeout);
         const Url = new URL(downloadInfo.url);
         if( !msg ) {
            msg = {
               type: 'info',
               filename: downloadInfo.filename
            };

            send(msg);
            console.log(`filename: ${msg.filename}`);
         }

         if( !realFilePath ) {
            const dirname = opts.dirname ||
               Path.dirname(downloadDest.path);
            realFilePath = Path.resolve(dirname, downloadInfo.filename);
         }

         if( !downloadDest ) {
            downloadDest = fs.createWriteStream(await createDownloadingPath(opts.dirname, downloadInfo.filename));
            send({
               type: 'dest',
               dest: downloadDest.path
            });
            console.log(`dest: ${downloadDest.path}`);
         }

         const requestOpts = {
            hostname: Url.hostname,
            path: Url.pathname + Url.search,
            headers: {}
         };

         if( downloadInfo.cookie )
            requestOpts.headers.cookie = downloadInfo.cookie;

         if( currSize ) {
            if( !downloadInfo.range ) {
               throw {
                  type: 'fatal',
                  message: 'this webside can not use range',
                  exitCode: 7
               };
            }
            requestOpts.headers.range = `${downloadInfo.range}=${currSize}-`;
         }

         await request(PROTOCOLS[DECODERS[opts.type].protocol], requestOpts);
         return;
      } catch(err) {
         if(typeof err === 'object') {
            if( err.type === 'fatal' )
               return err;
         }

         if( i < opts.retry - 1 )
            await delay(opts.retryDelay);
      }
   }

   return {
      type: 'fatal',
      message: 'can not download file',
      exitCode: 8
   };
}

async function main() {
   const opts = Opts.getOpts();
   if( !opts ) {
      console.error('argv fucked');
      return process.exit(-1);
   }

   switch( opts ) {
   case 'url':
      console.error('url is required');
      return process.exit(1);
   case 'type':
      console.error('type not found');
      return process.exit(2);
   case 'path':
      console.error('continuePath XOR dirname must = 1');
      return process.exit(3);
   }

   progressDelay = opts.progressDelay;

   let removeFail;
   if( opts.continuePath ) {
      opts.continuePath = normalizePath(opts.continuePath);

      try {
         currSize = (await fsPromise.stat(opts.continuePath)).size;
         downloadDest = fs.createWriteStream(opts.continuePath, {
            flags: 'a'
         });
      } catch(err) {
         console.error('can not read continuePath');
         return process.exit(5);
      }
   } else {
      opts.dirname = normalizePath(opts.dirname);

      try {
         const stats = await fsPromise.stat(opts.dirname);
         if( !stats.isDirectory() )
            throw 'not dir';

         removeFail = true;
      } catch(err) {
         console.log(err);
         console.error('dirname is not directory');
         return process.exit(6);
      }
   }

   const downloadErr = await start(opts);
   if( downloadErr ) {
      if( removeFail )
         await fsPromise.unlink(downloadDest.path);

      console.error(downloadErr.message);
      return process.exit(downloadErr.exitCode);
   }
}

main();