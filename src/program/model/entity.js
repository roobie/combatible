define([
  '../lib/lodash',
  '../util/hash'
], function(_, hash) {

  function Entity(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(Entity.prototype, {
    initialise: {
      value: function(properties) {
        this.$hash = hash.get();
        _.assign(this, properties);
      }
    }
  });

  return Entity;
});
