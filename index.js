/**
 * live runner for darlingjs (http://darlingjs.github.io)
 *
 * it starts update cycle of the world of darlingjs each time
 * after last promises has resolved
 */

'use strict';

var Promise = require('bluebird');

module.exports = function (ops) {
  ops = ops || {
    //prevent to stuck runner in empty infinity loop and add pause before next try
    delayOnIdle: 1000
  };
  return function (step) {
    var api = {};

    function iterateStep(previousTime) {
      var newTime = Date.now();
      return step(newTime - previousTime)
        .then(function(count) {
          if (count <= 0) {
            return Promise.delay(ops.delayOnIdle);
          }
        })
        .then(function () {
          if (!api.playing) {
            return null;
          }

          return iterateStep(newTime);
        });
    }

    api.start = function () {
      if (api.playing) {
        return api;
      }

      api.playing = true;

      iterateStep()
        .catch(api.stop);

      return api;
    };

    api.stop = function () {
      api.playing = false;

      return api;
    };

    if (ops.autostart) {
      api.start();
    }

    return api;
  };
};
