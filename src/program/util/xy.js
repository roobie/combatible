define([], function() {

  var xy_toString = function() {
    return this.x + ',' + this.y;
  };

  var xy_copy = function() {
    return xy(this.x, this.y);
  };

  function xy(x, y) {
    return {
      x: x,
      y: y,
      toString: xy_toString,
      copy: xy_copy
    };
  }

  return xy;
});
