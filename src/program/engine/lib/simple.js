define([
  'config',
  'util/window'
], function(config, window) {
  "use strict";

  var ROT = Object.create(null);

  ROT.EventQueue = (function() {
    /**
     * @class Generic event queue: stores events and retrieves them based on their time
     */
    function EventQueue() {
      this._time = 0;
      this._events = [];
      this._eventTimes = [];
    }

    /**
     * @returns {number} Elapsed time
     */
    EventQueue.prototype.getTime = function() {
      return this._time;
    };

    /**
     * Clear all scheduled events
     */
    EventQueue.prototype.clear = function() {
      this._events = [];
      this._eventTimes = [];
      return this;
    };

    /**
     * @param {?} event
     * @param {number} time
     */
    EventQueue.prototype.add = function(event, time) {
      var index = this._events.length;
      for (var i=0;i<this._eventTimes.length;i++) {
        if (this._eventTimes[i] > time) {
          index = i;
          break;
        }
      }

      this._events.splice(index, 0, event);
      this._eventTimes.splice(index, 0, time);
    };

    /**
     * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
     * @returns {? || null} The event previously added by addEvent, null if no event available
     */
    EventQueue.prototype.get = function() {
      if (!this._events.length) { return null; }

      var time = this._eventTimes.splice(0, 1)[0];
      if (time > 0) { /* advance */
        this._time += time;
        for (var i=0;i<this._eventTimes.length;i++) { this._eventTimes[i] -= time; }
      }

      return this._events.splice(0, 1)[0];
    };

    /**
     * Remove an event from the queue
     * @param {?} event
     * @returns {bool} success?
     */
    EventQueue.prototype.remove = function(event) {
      var index = this._events.indexOf(event);
      if (index == -1) { return false; }
      this._remove(index);
      return true;
    };

    /**
     * Remove an event from the queue
     * @param {int} index
     */
    EventQueue.prototype._remove = function(index) {
      this._events.splice(index, 1);
      this._eventTimes.splice(index, 1);
    };

    return EventQueue;
  })();

  ROT.Scheduler = (function() {
    /**
     * @class Abstract scheduler
     */
    function Scheduler() {
      this._queue = new ROT.EventQueue();
      this._repeat = [];
      this._current = null;
    }

    /**
     * @see ROT.EventQueue#getTime
     */
    Scheduler.prototype.getTime = function() {
      return this._queue.getTime();
    };

    /**
     * @param {?} item
     * @param {bool} repeat
     */
    Scheduler.prototype.add = function(item, repeat) {
      if (repeat) { this._repeat.push(item); }
      return this;
    };

    /**
     * Clear all items
     */
    Scheduler.prototype.clear = function() {
      this._queue.clear();
      this._repeat = [];
      this._current = null;
      return this;
    };

    /**
     * Remove a previously added item
     * @param {?} item
     * @returns {bool} successful?
     */
    Scheduler.prototype.remove = function(item) {
      var result = this._queue.remove(item);

      var index = this._repeat.indexOf(item);
      if (index != -1) { this._repeat.splice(index, 1); }

      if (this._current == item) { this._current = null; }

      return result;
    };

    /**
     * Schedule next item
     * @returns {?}
     */
    Scheduler.prototype.next = function() {
      this._current = this._queue.get();
      return this._current;
    };

    return Scheduler;
  })();

  ROT.Scheduler.Action = (function() {
    /**
     * Sets prototype of this function to an instance of parent function
     * @param {function} parent
     */
    var extend = function(parent) {
      this.prototype = Object.create(parent.prototype);
      this.prototype.constructor = this;
      return this;
    };

    /**
     * @class Action-based scheduler
     * @augments ROT.Scheduler
     */
    function Scheduler_Action() {
      ROT.Scheduler.call(this);
      this._defaultDuration = 1; /* for newly added */
      this._duration = this._defaultDuration; /* for this._current */
    };
    extend.call(Scheduler_Action, ROT.Scheduler);

    /**
     * @param {object} item
     * @param {bool} repeat
     * @param {number} [time=1]
     * @see ROT.Scheduler#add
     */
    Scheduler_Action.prototype.add = function(item, repeat, time) {
      this._queue.add(item, time || this._defaultDuration);
      return ROT.Scheduler.prototype.add.call(this, item, repeat);
    };

    Scheduler_Action.prototype.clear = function() {
      this._duration = this._defaultDuration;
      return ROT.Scheduler.prototype.clear.call(this);
    };

    Scheduler_Action.prototype.remove = function(item) {
      if (item == this._current) { this._duration = this._defaultDuration; }
      return ROT.Scheduler.prototype.remove.call(this, item);
    };

    /**
     * @see ROT.Scheduler#next
     */
    Scheduler_Action.prototype.next = function() {
      if (this._current && this._repeat.indexOf(this._current) != -1) {
        this._queue.add(this._current, this._duration || this._defaultDuration);
        this._duration = this._defaultDuration;
      }
      return ROT.Scheduler.prototype.next.call(this);
    };

    /**
     * Set duration for the active item
     */
    Scheduler_Action.prototype.setDuration = function(time) {
      if (this._current) { this._duration = time; }
      return this;
    };

    return Scheduler_Action;
  })();

  ROT.Engine = (function() {
    /**
     * @class Asynchronous main loop
     * @param {ROT.Scheduler} scheduler
     */
    function Engine(scheduler) {
      this._scheduler = scheduler;
      this._lock = 1;

      this._time = 0;
    }

    /**
     * Start the main loop. When this call returns, the loop is locked.
     */
    Engine.prototype.start = function() {
      // return this.unlock();

      window.requestAnimationFrame(this.unlock.bind(this));
      return this;
    };

    /**
     * Interrupt the engine by an asynchronous action
     */
    Engine.prototype.lock = function() {
      this._lock++;
      return this;
    };

    /**
     * Resume execution (paused by a previous lock)
     */
    Engine.prototype.unlock = function(timestamp) {
      var progress = timestamp - this._time;
      this._time = timestamp;

      // var time = this._scheduler.getTime();
      // var fps = time / progress * 1000;

      var self = this;
      if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
      this._lock--;

      var actor = this._scheduler.next();
      // no actors
      if (!actor) { return this.lock(); }

      var result = actor.act(function setDuration_bound(duration) {
        self._scheduler.setDuration(duration);
      });

      // actor returned a "thenable", looks like a Promise
      this.lock();
      if (result && result.then) {
          result.then(function() {
            window.requestAnimationFrame(self.unlock.bind(self));
          });
      } else {
        window.requestAnimationFrame(this.unlock.bind(this));
      }

      return this;
    };

    return Engine;
  })();

  return ROT;
});
