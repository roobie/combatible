define([
  'engine/instance',
  './area',
  '../lib/lodash'
], function (engine_instance, Area, _) {

  function World(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(World.prototype, {
    initialise: {
      value: function (properties) {
        Object.defineProperties(this, {
          areas: {
            value: []
          }
        });
        this.current_area_index = 0;
        this.cfg = properties;
      }
    },
    start: {
      value: function () {
        this.add_random_area();
        engine_instance.start();
      }
    },
    add_entity: {
      value: function () {
      }
    },
    remove_entity: {
      value: function () {
      }
    },
    add_random_area: {
      value: function () {
        this.areas.push(new Area(_.assign({
          random: true,
          populate: true
        }, this.cfg)));
      }
    }
  });

  return World;
});
