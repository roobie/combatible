module.exports = function getter(what) {
  return function __getter() {
    return what;
  }
};
