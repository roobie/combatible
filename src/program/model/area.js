define([
  //'./tile',
  './entities',

  'engine/scheduler',

  'display',
  'lib/lodash',
  'lib/rot',
  'util/xy',
  'util/clock'
], function (entities, scheduler, display, _, ROT, xy, clock) {

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
        if (properties.populate) {
          this.populate();
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

    get_top_entity_at: {
      value: function (pos) {
        return this[pos][0];
      }
    },

    draw_at: {
      value: function(p) {
        var top_ent = this.get_top_entity_at(p),
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

    non_blocked_tiles: {
      get: function non_blocked_tiles() {
        var area = this,
            atp = this.all_tile_positions,
            result = [];
        return _(this.all_tile_positions)
          .filter(function filter_blocking(pos) {
            return !_.some(area[pos], { blocking: true });
          })
          .valueOf();
      }
    },

    is_passable: {
      value: function(pos) {
        var any_blocking = function(arr) {
          //return _.some(arr, { blocking: true });

          // Optimisation. Increase FPS by 10%
          for(var i = 0; i < arr.length; i++) {
            if (arr[i].blocking) { return true; }
          }
          return false;
        };
        return this.is_inside_map(pos) &&
          !any_blocking(this[pos] || []);
      }
    },

    is_inside_map: {
      value: function(pos) {
        return pos.x > -1 && pos.y > -1 && pos.x < this.width && pos.y < this.height;
      }
    },

    add: {
      value: function(pos, entity, is_actor) {
        this[pos].unshift(entity);
        entity.pos = pos.copy();
        if (is_actor) {
          Object.defineProperty(entity, 'parent_area', {
            value: this,
            //writable: true,
            configurable: true
          });
          scheduler.add(entity, is_actor);
        }
      }
    },

    reposition: {
      value: function(what, to_pos) {
        var from_pos = what.pos;
        var current = this[from_pos];
        _.remove(current, what);
        this.draw_at(from_pos);
        this[to_pos].unshift(what);
        what.pos = to_pos.copy();
        this.draw_at(to_pos);
      }
    },

    populate: {
      value: function() {
        var nbt = this.non_blocked_tiles;
        var area = this;

        _.range(0, 20).forEach(function() {
          var pos = _.sample(nbt);

          // tile.add(entities.creatures.gorm.adult(), true);
          var ctype = Math.random() < 0.5 ? 'gorm' : 'tera';
          var c = entities.creatures[ctype].adult();
          area.add(pos, c, true);
          _.remove(pos, nbt);
        });


        clock.create_interval({
          cycle_length: 100,
          fn: function() {
            var nbt = area.non_blocked_tiles;
            _.range(0, nbt.length / 100).forEach(function() {
              var pos = _.sample(nbt);
              area.add(pos, entities.misc.edible_mushrooms());
              area.draw_at(pos);
              _.remove(nbt, pos);
            });
          }
        });
      }
    },
    generate_procedural: {
      value: function() {
        var area = this;
        var non_blocked_cells = [];

        var generator_name = _.sample([
          // 'Arena',
          'DividedMaze',
          // 'IceyMaze',
          // 'EllerMaze',
          // 'Cellular',
          // 'Digger',
          // 'Uniform',
          // 'Rogue'
        ]);

        var map_creator = new ROT.Map[generator_name](
          area.width,
          area.height);

        var dig = function(x, y, value) {
          var p = xy(x, y);
          if (value) {
            this.add(p, entities.walls.simple());
          } else {
            non_blocked_cells.push(p);
            this.add(p, entities.floors.simple());
          }
        };

        if (generator_name === 'Cellular') {
          map_creator.randomize(0.48);
          for(var i = 0; i < 10; i++) {
            map_creator.create();
          }
        }
        map_creator.create(dig.bind(this));
      }
    },
    generate_tiles: {
      value: function() {
        var area = this;
        this.all_tile_positions.forEach(function(pos) {
          area[pos] = [];
        });
      }
    }
  });

  return Area;
});
