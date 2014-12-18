define([
  'model/world',

  'lib/rot',
  'lib/lodash',

  'util/window'
], function(World, ROT, _, window) {

  var display_cfg = {
    width: 20,
    height: 10,
    fontSize: 18,
    fontFamily: 'Courier New',
    bg: '#222'
  };

  var onLoad = function _onLoad() {
    window.removeEventListener('load', _onLoad);
    window.document
      .getElementById('main-view')
      .appendChild(game.display.getContainer());
    game.create_world();
    game.world.start();
  };

  var game = Object.create(null, {
    initialise: {
      value: function () {
        window.addEventListener('load', onLoad, false);
        onLoad();
      }
    },
    display: {
      value: new ROT.Display(_.assign({}, display_cfg))
    },
    create_world: {
      value: function() {
        this.world = new World(_.assign({
          display: this.display
        }, display_cfg));
      }
    }
  });

  return game;
});
