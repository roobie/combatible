define([
  '../lib/lodash',
  './entity',
  './entity.animate',
], function(_, Entity, Animate) {
  var get_base_entity = function() {
    return {
      meta: [],
      tracked: void 0,
      blocking: void 0,
      repr: {
        glyph: "",
        color: {
          fg: "#",
          bg: "#"
        }
      }
    };
  };

  var getter = {
    actor: function(base_properties) {
      return function(extra_properties) {
        return new Animate(
          _.assign(
            {},
            get_base_entity(),
            base_properties,
            extra_properties)
        );
      };
    },
    non_actor: function(base_properties) {
      return function(extra_properties) {
        return new Entity(
          _.assign(
            {},
            get_base_entity(),
            base_properties,
            extra_properties)
        );
      };
    }
  };

  var entities = Object.create(null, {
    creatures: {
      value: {
        gorm: {
          adult: getter.actor({
            meta: [
              {type: 'race_name', value: 'gorm'},
              {type: 'type', value: 'creature'}
            ],
            tracked: true,
            blocking: false,
            repr: {
              glyph: 'G',
              color: {
                fg: 'salmon',
                bg: '#111'
              }
            }
          })
        },

        tera: {
          adult: getter.actor({
            meta: [
              {type: 'race_name', value: 'tera'},
              {type: 'type', value: 'creature'}
            ],
            tracked: true,
            blocking: false,
            repr: {
              glyph: 'T',
              color: {
                fg: 'springgreen',
                bg: '#111'
              }
            }
          })
        }
      }
    },

    misc: {
      value: {
        // spinner: getter.actor({
        //   meta: [
        //     {type: 'type', value: 'spinner'}
        //   ],
        //   blocking: false,
        //   repr: {}
        // }),

        edible_mushrooms: getter.non_actor({
          meta: [
            {type: 'name', value: 'mushrooms'},
            {type: 'type', value: 'stationary_organism'}
          ],
          blocking: false,
          repr: {
            glyph: "τ",
            color: {
              fg: "#6A5ACD",
              bg: "#111"
            }
          }
        })
      }
    },

    walls: {
      value: {
        simple: getter.non_actor({
          meta: [
            {type: 'name', value: 'wall'},
            {type: 'type', value: 'structure'}
          ],
          blocking: true,
          repr: {
            glyph: '#',
            color: {
              fg: '#333',
              bg: '#111'
            }
          }
        })
      }
    },

    floors: {
      value: {
        simple: getter.non_actor({
          meta: [
            {type: 'name', value: 'floor'},
            {type: 'type', value: 'structure'}
          ],
          blocking: false,
          repr: {
            glyph: 'X',//'·',
            color: {
              fg: '#111',
              bg: '#000'
            }
          }
        })
      }
    }
  });

  return entities;
});
