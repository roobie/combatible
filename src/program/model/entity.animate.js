define([
  './entity',
  'engine/scheduler'
], function(Entity, scheduler) {

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
    calculate_duration: {
      value: function(base_duration) {
        return base_duration;
      }
    },
    act: {
      value: function() {
        var action = this.ai ? this.ai.act() : null;

        var d = this.calculate_duration((action || 0).base_duration || 1);

        scheduler.setDuration(d);
        return action;
      }
    }
  });

  return Animate;
});
