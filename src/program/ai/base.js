define([
  'engine/scheduler'
], function(scheduler) {

  function AI(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(AI.prototype, {
    initialise: {
      value: function(properties) {
      }
    },
    observe: {
      value: function() {
      }
    },
    act: {
      value: function() {
        return {};
      }
    }
  });

  return AI;
});
