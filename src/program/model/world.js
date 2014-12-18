define([
  './area',
  '../engine/main',
  '../lib/lodash'
], function (Area, engine, _) {

  function World(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(World.prototype, {
    initialise: {
      value: function (properties) {
        var scheduler = new engine.Scheduler.Action();
        var engine_instance = new engine.Engine(scheduler);

        Object.defineProperties(this, {
          engine: {
            get: function () {
              return engine_instance;
            }
          },
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
        this.engine.start();
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
          display: this.cfg.display,
          random: true
        }, this.cfg)));
      }
    }
  });

  return World;
});
