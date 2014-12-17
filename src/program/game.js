define([
  'engine/main',
  'lib/rot'
], function(engine, ROT) {

  var scheduler = new engine.Scheduler.Action();
  var engine_instance = new engine.Engine(scheduler);

  var game_display = new ROT.Display({
    width: 20,
    height: 10,
    fontSize: 10,
    fontFamily: 'Courier New',
    bg: '#222'
  });

  var onLoad = function _onLoad() {
    window.removeEventListener('load', _onLoad);
    window.document
      .getElementById('main-view')
      .appendChild(game_display.getContainer());
    engine_instance.start();
  };

  return {
    initialise: function () {
      window.addEventListener('load', onLoad, false);
      onLoad();
    }
  };
});
