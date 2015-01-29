define([], function() {
  var counter = parseInt('zz', 36);

  return {
    get: function() {
      return ++counter;
    }
  };
});
