API
===

Functions
---

### `syDownloader(opts)`

This function returns a `SyDownload` instant.

`opts.url`: the target url.

`opts.continuePath`: the existed file path that is downloaded in progress.
Required if `dirname` is not set.

`opts.dirname`: the download directory path.
Required if `continuePath` is not set.

`opts.timeout`: the request timeout in millis.
Default to `30000`.

`opts.retry`: the max retry count of the request.
Default to `3`.

`opts.retryDelay`: the delay in millis between retries.
Default to `3000`.

`opts.progressDelay`: the delay in millis between progress events emit.
Default to `1000`.



Methods
---

### `cancel()`

This method will kill the child process with `SIGINT`, 
and will NOT call the `onClose` handler.

The `dest` file will not be removed by the child process.

You should remove `dest` file by self if needed.



### `onFilenameGot(handler)`

`handler` receive an argument `data` type of `object`.

`data.filename` is the filename from the download url.



### `onDestGot(handler)`

`handler` receive an argument `data` type of `object`.

`data.dest` is the path of the working file.



### `onProgress(handler)`

`handler` receive an argument `data` type of `object`.

`data.size` is the size downloaded in bytes.

`data.total` is the total size of this file.

`data.total` may not exist if the response headers 
do not contain the `Content-Length` data.



### `onComplete(handler)`

`handler` receive an argument `data` type of `object`

`data.path` is the downloaded file path.



### `onClose(handler)`

`handler` receive an argument `err` type of `string`.

If `err` is `undefined`, that means download is complete.

If `err` existed, which would be:

* `'unexpect_argv_key'`
* `'missing_url'`
* `'path_conflict'`
* `'continue_path_not_found'`
* `'dirname_error'`
* `'url_not_support'`
* `'range_not_suport'`
* `'resolve_info_error'`
* `'download_error'`
* `'unhandled_rejection'`
* `'exit_code_bugs'`



### `onChildProcessError(handler)`

`handler` receive an argument `err`.

This will emit when the child process emits `error` event.



CLI
===

### `node src/bin/sy-downloader.js <args>`

`args` has a mapping to the function `syDownloader(opts)`'s `opts`:

```
-u:                   url
--url:                url
-cp:                  continuePath
--continue-path:      continuePath
-d:                   dirname
--dirname:            dirname
-tm:                  timeout
--timeout:            timeout
-r:                   retry
--retry:              retry
-rd:                  retryDelay
--retry-delay:        retryDelay
-pd:                  progressDelay
--progress-delay:     progressDelay
```
