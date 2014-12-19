define([
  'lib/lodash',
  'engine/scheduler'
], function(_, scheduler) {


  function Tile(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(Tile.prototype, {
    initialise: {
      value: function(properties) {
        _.assign(this, properties);
        this.entities = properties.entities || [];
      }
    },
    add: {
      value: function(thing, is_actor) {
        this.entities.unshift(thing);
        if (is_actor) {
          scheduler.add(thing, true);
        }
      }
    },
    get_top_entity: {
      value: function() {
        // TODO: check for most interesting thing.
        // i.e. blocking > non-blocking
        return this.entities[0];
      }
    },
    draw: {
      value: function() {
        this.parent.draw_at(this.pos);
      }
    }
  });

  return Tile;
});
