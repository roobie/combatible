define([
  'lib/lodash',
  'lib/rot',
  'util/xy'
], function(_, ROT, xy) {

  function AI(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(AI.prototype, {
    initialise: {
      value: function(properties) {
        // this.entity = properties.entity;
      }
    },

    compute_observable_data: {
      value: function(entity) {
      }
    },

    get_path: {
      value: function(from, to) {
        return [xy(0,0)];
      }
    },

    compute_path: {
      value: function(area, from, to) {
        var passable_fn = function (x, y) {
          return area.is_passable(xy(x, y));
        };

        //var path_finder = new ROT.Path.Dijkstra(to.x, to.y, passable_fn);
        var path_finder = new ROT.Path.AStar(to.x, to.y, passable_fn);

        var path = [];
        path_finder.compute(from.x, from.y, function(x, y) {
          path.push(xy(x, y));
        });

        this.$current_path = path;
      }
    },

    get_next_pos: {
      value: function(entity) {
        var path = this.$current_path;
        return path.shift();
      }
    },

    act: {
      value: function() {
        var ai = this;
        return {
          exec: function(entity) {
            var new_dest = function() {
              var a = entity.parent_area;
              var nbt = a.non_blocked_tiles;
              entity.dest = ai.$destination = _.sample(nbt);
              if (entity.pos.equals(entity.dest)) {
                _.remove(nbt, entity.dest);
                entity.dest = ai.$destination = _.sample(nbt);
              }
              ai.compute_path(a, entity.pos, ai.$destination);
            };

            if (!ai.$destination) {
              new_dest();
            }

            var next_pos = (function rec() {
              var p = ai.get_next_pos(entity);
              if (!p) {
                new_dest();
                return rec();
              }

              return p;
            })();
            //ai.compute_observable_data(entity);
            entity.moved_count = (entity.moved_count || 0) + 1;
            entity.move_to(next_pos);
          },
          base_duration: 1
        };
      }
    }
  });

  return AI;
});
