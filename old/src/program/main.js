require([
  'game',
  'lib/radio',
  'data/log',
  'ui_compiled/App'
], function(game, radio, log) {
  radio('log:system').broadcast({
    level: 'debug',
    message: 'MAIN: Initialising simulation'
  });

  game.initialise();
});
