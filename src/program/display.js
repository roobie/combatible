define([
  'lib/lodash',
  'lib/rot'
], function(_, ROT) {
  var display_cfg = {
    width: 40,
    height: 14,
    fontSize: 20,
    fontFamily: 'Courier New',
    bg: '#222'
  };

  return new ROT.Display(_.assign({}, display_cfg));
});
