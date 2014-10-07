define([], function() {
  function Facade(properties) {
    this.initialise(properties);
  }

  Facade.prototype.initialise = function (properties) {
    return true;
  };

  Facade.prototype.run = function () {
    console.log('Application running');
  };

  return new Facade({});
});
