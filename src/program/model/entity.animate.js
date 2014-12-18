define([
  './entity'
], function(Entity) {

  function Animate(properties) {
    this.initialise(properties);
  }

  // Animate.prototype = Object.create(Entity.prototype, {
  // });

  Object.defineProperties(Animate.prototype, {
    initialise: {
      value: function(properties) {
        Entity.prototype.initialise.call(this, properties);
      }
    },
    act: {
      value: function() {
        var action = this.ai ? this.ai.act() : null;
        return action;
      }
    }
  });
});
