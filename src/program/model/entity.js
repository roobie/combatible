define([
  'lib/lodash',
  'util/hash',

  'engine/scheduler',

  'data/tracked_objects'
], function(_, hash, scheduler, tracked_objects) {

  function Entity(properties) {
    this.initialise(properties);
  }

  Object.defineProperties(Entity.prototype, {
    initialise: {
      value: function(properties) {
        this.$hash = hash.get();
        this.$created_time = scheduler.getTime();

        _.assign(this, properties);

        if (this.tracked) {
          tracked_objects.entities[this.$hash] = this;
        }
      }
    },
    age: {
      get: function () {
        return scheduler.getTime() - this.$created_time;
      }
    },
    toString: function () {
      return this.constructor.name + '#{' + this.$hash + '}';
    }
  });

  return Entity;
});
