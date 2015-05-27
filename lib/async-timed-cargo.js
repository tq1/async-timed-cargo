(function() {
  // _each, _isArray and _map from async lib
  // https://github.com/caolan/async/blob/996ff7fcff6a34ba94d09cbd8a1a6ea3e6d36481/lib/async.js#L40-L59

  var _isArray = Array.isArray || function (obj) {
      return _toString.call(obj) === '[object Array]';
  };

  var _each = function (arr, iterator) {
      if (arr.forEach) {
          return arr.forEach(iterator);
      }
      for (var i = 0; i < arr.length; i += 1) {
          iterator(arr[i], i, arr);
      }
  };

  var _map = function (arr, iterator) {
      if (arr.map) {
          return arr.map(iterator);
      }
      var results = [];
      _each(arr, function (x, i, a) {
          results.push(iterator(x, i, a));
      });
      return results;
  };

  var Cargo = function(worker, payload, timeout) {

    if (!timeout) {
      timeout = 1000;
    }

    var tasks = [],
        working = false,
        timerRunning = false,
        intevalId = null;

    var cargo = {
      empty: null,
      length: function() {
        return tasks.length
      },
      push: function (data, callback) {
        cargo.start();
        if (!_isArray(data)) {
            data = [data];
        }
        _each(data, function(task) {
            tasks.push({
                data: task,
                callback: typeof callback === 'function' ? callback : null
            });
            if (tasks.length === payload) {
              cargo.process(); // TODO: check for stack overflow https://github.com/caolan/async/issues/696
            }
        });
      },
      process: function process() {
          if (working) return;
          // stops and if empty it will start again after data is added
          cargo.stop();
          if (tasks.length === 0) { return; }

          var ts = typeof payload === 'number'
                      ? tasks.splice(0, payload)
                      : tasks.splice(0, tasks.length);

          var ds = _map(ts, function (task) {
              return task.data;
          });

          working = true;
          worker(ds, function () {
              working = false;

              var args = arguments;
              _each(ts, function (data) {
                  if (data.callback) {
                      data.callback.apply(null, args);
                  }
              });

              cargo.start();
              process();
          });
      },
      processing: function() {
        return working;
      },
      running: function() {
        return timerRunning;
      },
      start: function() {
        if (timerRunning) { return; }
        timerRunning = true;
        intevalId = setInterval(cargo.process, timeout);
      },
      stop: function() {
        if (!timerRunning) { return; }
        timerRunning = false;
        clearInterval(intevalId);
      }
    }

    return cargo;
  };

  // Node.js
  if (typeof module !== 'undefined' && module.exports) {
      module.exports = Cargo;
  }
  // AMD / RequireJS
  else if (typeof define !== 'undefined' && define.amd) {
      define([], function () {
          return Cargo;
      });
  }
  // included directly via <script> tag
  else {
    return Cargo;
  }

})();
