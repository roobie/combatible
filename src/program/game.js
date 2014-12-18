define([
  'display',

  'model/world',

  'lib/rot',
  'lib/lodash',

  'util/window'
], function(display, World, ROT, _, window) {

  var display_cfg = display.getOptions();

  var onLoad = function _onLoad() {
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
