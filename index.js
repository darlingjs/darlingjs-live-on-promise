/**
 * live runner for darlingjs (http://darlingjs.github.io)
 *
 * it starts update cycle of the world of darlingjs each time
 * after last promises has resolved
 */

'use strict';

module.exports = function (ops) {
  ops = ops || {};
  return function (step) {
    var api = {};

    function iterateStep(previousTime) {
      var newTime = Date.now();
      return step(newTime - previousTime)
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

      iterateStep(Date.now())
        .catch(api.stop);

      return api;
    };

    api.stop = function () {
      if (!api.playing) {
        return api;
      }

      api.playing = false;

      return api;
    };

    if (ops.autostart) {
      api.start();
    }

    return api;
  };
};
