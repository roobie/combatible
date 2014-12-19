define([
], function() {

  function AI(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(AI.prototype, {
    initialise: {
      value: function(properties) {
        this.entity = properties.entity;
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
