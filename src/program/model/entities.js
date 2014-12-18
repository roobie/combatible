define([
  '../lib/lodash',
  './entity'
], function(_, Entity) {
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

  var getter = function(base_properties) {
    return function(extra_properties) {
      return new Entity(
        _.assign(
          {},
          get_base_entity(),
          base_properties,
          extra_properties)
      );
    };
  };

  var entities = Object.create(null, {
    creatures: {
      value: {

      }
    },
    walls: {
      value: {
        simple: getter({
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
        simple: getter({
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
