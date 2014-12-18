define([], function() {

  var xy_toString = function() {
    return this.x + ',' + this.y;
  };

  function xy(x, y) {
    return {
      x: x,
      y: y,
      toString: xy_toString
    };
  }

  return xy;
});
