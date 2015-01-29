define([
  'engine/lib/simple',
  'engine/scheduler'
], function(engine, scheduler_instance) {

  var engine_instance = new engine.Engine(scheduler_instance);

  return engine_instance;
});
