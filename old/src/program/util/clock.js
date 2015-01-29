define([
  'util/window',
  'engine/scheduler'
], function(window, scheduler) {
  return {
    create_interval: function(config) {

      var tid,
          game_time_cycle_start;

      return (function rec() {
        var this_arg = config.this_arg,
            cycle_length = config.cycle_length,
            fn = config.fn,
            timeout = config.timeout || 500,
            stop = config.stop;

        if (stop) {
          return null;
        }

        if (tid) {
          window.clearTimeout(tid);
        }

        if (!game_time_cycle_start) {
          game_time_cycle_start = scheduler.getTime();
        }

        tid = window.setTimeout(function() {
          if ((scheduler.getTime() - game_time_cycle_start) >
              cycle_length) {
            game_time_cycle_start = null;

            fn.call(this_arg);
          }
          rec();
        }, timeout);

        return tid;
      })();
    }
  };
});
