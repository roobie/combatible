define([
  './tile',
  '../lib/lodash',
  '../lib/rot',
  '../util/xy'
], function (Tile, _, ROT, xy) {

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
    draw_all: {
      value: function() {
        var area = this;
        this.all_tile_positions.forEach(function(pos) {
          area[pos].draw();
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
            this[p].add({
              names: [{ type: "name", value: "wall" }],
              blocking: true,
              repr: {
                glyph: "#",
                color: {
                  fg: "#333",
                  bg: "#111"
                }
              }
            });
          } else {
            non_blocked_cells.push(p);
            this[p].add({
                names: [{ type: "name", value: "floor" }],
                blocking: false,
                repr: {
                    glyph: "·",
                    color: {
                        fg: "#666",
                        bg: "#000"
                    }
                }
            });
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
            display: area.display,
            pos: pos,
            parent: area
          });
        });
      }
    }
  });

  return Area;
});
