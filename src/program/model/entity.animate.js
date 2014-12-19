define([
  './entity',
  'ai/base'
], function(Entity, BaseAI) {

  function Animate(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(Animate.prototype, {
    initialise: {
      value: function(properties) {
        Entity.prototype.initialise.call(this, properties);

        Object.defineProperties(this, {
          ai: {
            value: new BaseAI({
              entity: this
            })
          }
        });
        // this.body = new properties.body || BaseBody();
      }
    },
    calculate_duration: {
      value: function(base_duration) {
        return base_duration;
      }
    },
    act: {
      value: function(set_duration) {
        var action = this.ai ? this.ai.act() : null;

        var d = this.calculate_duration((action || 0).base_duration || 1);
        set_duration(d);

        return action;
      }
    }
  });

  return Animate;
});
