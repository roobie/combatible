define([
  'display',

  'model/world',

  'engine/scheduler',

  'data/tracked_objects',

  'lib/radio',
  'lib/rot',
  'lib/lodash',

  'util/window'
], function(display, World, scheduler, tracked_objects, radio, ROT, _, window) {

  var display_cfg = display.getOptions();

  radio('log:system').broadcast({
    level: 'debug',
    message: 'Adding dummy actor to scheduler.'
  });
  scheduler.add({
    act: function () {
      scheduler.setDuration(1);

      tracked_objects.meta.engine = {
        time: 1 + ((tracked_objects.meta.engine || {}).time || 0)
      };
      radio('data_changed').broadcast(tracked_objects);
    }
  }, true);

  var onLoad = function _onLoad() {
    radio('log:system').broadcast({
      level: 'debug',
      message: 'Appending canvas to element, and starting the game engine.'
    });

    window.removeEventListener('load', _onLoad);
    window.document
      .getElementById('main-view')
      .appendChild(display.getContainer());
    game.world.start();
  };

  var game = Object.create(null, {
    initialise: {
      value: function () {
        window.addEventListener('load', onLoad, false);
        onLoad();
      }
    },
    world: {
      value: new World(_.assign({}, display_cfg))
    }
  });

  return game;
});
