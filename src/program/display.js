define([
  'lib/lodash',
  'lib/rot'
], function(_, ROT) {
  var display_cfg = {
    width: 100,
    height: 32,
    fontSize: 13,
    fontFamily: 'Courier New',
    bg: '#222'
  };

  return new ROT.Display(_.assign({}, display_cfg));
});
