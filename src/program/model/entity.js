var
_ = require('lodash'),
u = require('../utilities/all.js');

var validate = function () {
  return true;
};

function Entity(props) {
  this.init(props);
}

_.assign(Entity, {
  random: function () {
    var rand = function () {
      return 10 - (Math.random() * 7 | 0);
    };

    return new Entity({
      ai: {
        act: function () { }
      },
      body: {
        get_effects: function () { }, // -> Array
        get_status: function () { }, // -> Object
        anatomy: [
          { type: 'head' },
          { type: 'torso' },
          { type: 'arm' },
          { type: 'arm' },
          { type: 'leg' },
          { type: 'leg' },
        ],
        stats: (function () {
          return [
            'strength',
            'endurance',
            'dexterity',
            'agility',
            'memory',
            'spirit',
          ].reduce(function (out, next) {
            out[next] = u.prop(rand());
            return out;
          }, {
            get_speed: function (status) {
              var val = (((status.fatigue || 1) * this.endurance) +
                         (this.strength / 2) +
                         this.agility) | 0;

              return Math.pow(val/100, -1);
            }
          });
        }).call()
      },
      soul: {
        get_effects: function () { }, // -> Array
        get_status: function () { }, // -> Object
        skills: {

        }
      }
    });
  }
});

_.assign(Entity.prototype, {
  init: function (props) {
    var p = props;

    validate(p);

    _.assign(this, {
      id: u.getter(u.getId()),
      timestamp: u.getter(new Date().valueOf()),
      body: u.prop(p.body),
      soul: u.prop(p.soul),
      ai: u.prop(p.ai)
    });
  }
});

module.exports = Entity;
