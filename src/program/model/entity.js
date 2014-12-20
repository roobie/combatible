define([
  'lib/lodash',
  'lib/radio',
  'util/hash',

  'engine/scheduler',

  'data/tracked_objects'
], function(_, radio, hash, scheduler, tracked_objects) {

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
          window.t = tracked_objects;
        }
      }
    },
    age: {
      get: function () {
        return scheduler.getTime() - this.$created_time;
      },
      enumerable: true
    },
    move_to: {
      value: function(to_pos) {
        // this.parent_area.can(this).move_to(to_pos);
        this.parent_area.reposition(this, to_pos);
      }
    },
    toString: function () {
      return this.constructor.name + '#{' + this.$hash + '}';
    }
  });

  return Entity;
});
