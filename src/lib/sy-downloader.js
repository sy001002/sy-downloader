const EE = require('events').EventEmitter;
const path = require('path');
const { fork } = require('child_process');
const autoBind = require('auto-bind');
const { ARGV_MAP_REVERSED } = require('../bin/util/opts');

class SyDownloader {
   constructor(opts) {
      autoBind(this);
      this._ee = new EE();

      const args = [];
      for(const key in opts) {
         if( !Array.isArray(ARGV_MAP_REVERSED[key]) )
            continue;
         args.push(ARGV_MAP_REVERSED[key][0], opts[key]);
      }

      this._child = fork(
         path.resolve(__dirname, '../bin/sy-downloader.js'),
         args,
         {
            silent: true
         }
      );

      this._child.on('close', this._onChildClose);
      this._child.on('error', this._onChildError);
      this._child.on('message', this._onChildMessage);
   }

   _onChildClose(code) {
      let err;

      switch(code) {
      case 0:
         break;
      case 1:
         err = 'unexpect_argv_key';
         break;
      case 2:
         err = 'missing_url';
         break;
      case 3:
         err = 'path_conflict';
         break;
      case 4:
         err = 'continue_path_not_found';
         break;
      case 5:
         err = 'dirname_error';
         break;
      case 6:
         err = 'url_not_support';
         break;
      case 7:
         err = 'range_not_suport';
         break;
      case 8:
         err = 'resolve_info_error';
         break;
      case 9:
         err = 'download_error';
         break;
      case 10:
         err = 'unhandled_rejection';
         break;
      default:
         err = 'exit_code_bugs';
      }

      if( !this._canceled )
         this._ee.emit('child_close', err);
      this._ee.removeAllListeners();
   }

   _onChildError(err) {
      this._ee.emit('child_error', err);
   }

   _onChildMessage(msg) {
      switch( msg.type ) {
      case 'progress':
         return this._ee.emit('child_progress', msg);
      case 'info':
         return this._ee.emit('child_filename', msg);
      case 'dest':
         return this._ee.emit('child_dest', msg);
      case 'complete':
         return this._ee.emit('child_complete', msg);
      }
   }

   cancel() {
      if( !this._canceled ) {
         this._canceled = true;
         this._child.kill('SIGINT');
      }
   }

   onComplete(handler) {
      this._ee.on('child_complete', handler);
   }

   onClose(handler) {
      this._ee.on('child_close', handler);
   }

   onProgress(handler) {
      this._ee.on('child_progress', handler);
   }

   onFilenameGot(handler) {
      this._ee.on('child_filename', handler);
   }

   onDestGot(handler) {
      this._ee.on('child_dest', handler);
   }

   onChildProcessError(handler) {
      this._ee.on('child_error', handler);
   }
}

module.exports = SyDownloader;
