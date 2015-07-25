# darlingjs-live-on-promise [![Build Status](https://travis-ci.org/darlingjs/darlingjs-live-on-promise.svg)](https://travis-ci.org/darlingjs/darlingjs-live-on-promise)
Update [darlingjs](http://darlingjs.github.io) pipeline on last solver promise.

## Example

```javascript
var onPromise = require('darlingjs-live-on-promise');

darling
  .world()
  .pipe(doSomeLazyThings())
  .live(onPromise({
    autostart: true
  }));

```
