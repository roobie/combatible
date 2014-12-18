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
    draw: {
      value: function() {
        var p = this.pos,
            top_ent = this.entities[0],
            r = top_ent.repr;
        this.display.draw(p.x, p.y, r.glyph, r.color.fg, r.color.bg);
      }
    }
  });

  return Tile;
});
