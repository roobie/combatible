define([
  'lib/lodash',
  'lib/rot'
], function(_, ROT) {
  var display_cfg = {
    width: 80,
    height: 24,
    fontSize: 14,
    fontFamily: 'Courier New',
    bg: '#222'
  };

  return new ROT.Display(_.assign({}, display_cfg));
});
