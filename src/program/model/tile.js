define([
  '../lib/lodash'
], function(_) {


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
      value: function(thing) {
        this.entities.unshift(thing);
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
