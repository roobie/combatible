define([
  'lib/radio'
], function(radio) {

  var startTime = new Date().valueOf();

  var logs = {
    system: [],
    simulation: []
  };

  var types = Object.keys(logs);

  types.forEach(function(type) {
    radio('log:' + type).subscribe(function (data) {
      data.time = new Date();
      logs[type].push(data);
      console.log('ΔT = [' + (data.time.valueOf() - startTime) + ']: ' + data.message);
    });
  });

  return logs;
});
