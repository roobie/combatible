define([
  './entity',
  'lib/rot',
  'lib/lodash',
  'ai/base'
], function(Entity, ROT, _, BaseAI) {

  function Animate(properties) {
    this.initialise(properties);
  }

  Animate.prototype = Object.create(Entity.prototype, {
    constructor: {
      value: Animate
    },
    initialise: {
      value: function(properties) {
        Entity.prototype.initialise.call(this, properties);

        this.speed = _.sample([
          0.6,
          0.7,
          0.8,
          0.9
        ]);

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
        return 1 / (base_duration * this.speed);
        //return parseInt(1 / (base_duration * this.speed));
      }
    },
    act: {
      value: function(set_duration) {
        var action = this.ai ? this.ai.act() : null;

        var d = this.calculate_duration((action || 0).base_duration || 1);
        set_duration(d);
        action.exec(this);

        return action;
      }
    }
  });

  return Animate;
});
