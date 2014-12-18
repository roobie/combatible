define([
  './tile',
  './entities',
  '../display',
  '../lib/lodash',
  '../lib/rot',
  '../util/xy'
], function (Tile, entities, display, _, ROT, xy) {

  function Area(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(Area.prototype, {
    initialise: {
      value: function (properties) {
        _.assign(this, properties);

        this.generate_tiles();

        if (properties.random) {
          this.generate_procedural();
        }

        this.draw_all();
      }
    },
    all_tile_positions: {
      get: function() {
        var area = this,
            w = area.width,
            h = area.height;

        var a = _.range(0, w).map(function(x) {
          return _.range(0, h).map(function(y) {
            return xy(x, y);
          });
        });

        return _(a).flatten().valueOf();
      }
    },
    draw_at: {
      value: function(p) {
        var top_ent = this[p].get_top_entity(),
            r = top_ent.repr;
        display.draw(p.x, p.y, r.glyph, r.color.fg, r.color.bg);
      }
    },
    draw_all: {
      value: function() {
        var area = this;
        this.all_tile_positions.forEach(function(pos) {
          area.draw_at(pos);
        });
      }
    },
    generate_procedural: {
      value: function() {
        var area = this;
        var non_blocked_cells = [];

        var map_creator = new ROT.Map.Cellular(area.width,
                                               area.height);
        map_creator.randomize(0.42);

        var dig = function(x, y, value) {
          var p = xy(x, y);
          if (value) {
            this[p].add(entities.walls.simple());
          } else {
            non_blocked_cells.push(p);
            this[p].add(entities.floors.simple());
          }
        };

        map_creator.create(dig.bind(this));
      }
    },
    generate_tiles: {
      value: function() {
        var area = this;
        this.all_tile_positions.forEach(function(pos) {
          area[pos] = new Tile({
            pos: pos,
            parent: area
          });
        });
      }
    }
  });

  return Area;
});
