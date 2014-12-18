define([
  '../lib/lodash',
  './entity',
  './entity.animate',
], function(_, Entity, Animate) {
  var get_base_entity = function() {
    return {
      names: [],
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
              {type: 'name', value: 'gorm'},
              {type: 'type', value: 'creature'}
            ],
            blocking: false,
            repr: {
              glyph: 'G',
              color: {
                fg: 'cornflowerblue',
                bg: '#111'
              }
            }
          })
        }
      }
    },
    misc: {
      value: {
        edible_mushrooms: getter.non_actor({
          meta: [
            {type: 'name', value: 'mushrooms'},
            {type: 'type', value: 'stationary_organism'}
          ],
          blocking: true,
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
