
function gettersetter(store) {
  var prop = function() {
    if (arguments.length) store = arguments[0];
    return store;
  };

  prop.toJSON = function() {
    return store;
  };

  return prop;
}

var prop = function (store) {
  return gettersetter(store)
};

module.exports = prop;
