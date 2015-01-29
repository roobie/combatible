var
_ = require('lodash'),
u = require('../utilities/all.js');

var validate = function () {
  return true;
}

var skeletons = {
  body: {

  }
}

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
        stats: {
          primary: [
            'str',
            'end',
            'dex',
            'agi'
          ].reduce(function (out, next) {
            out[next] = u.prop(rand());
            return out;
          }, {}),
          secondary: {

          }
        }
      },
      soul: {
        get_effects: function () { }, // -> Array
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
      id: u.getter(getId()),
      timestamp: u.getter(new Date().valueOf()),
      body: u.prop(p.body),
      soul: u.prop(p.soul),
      ai: u.prop(p.ai)
    })
  }
});
