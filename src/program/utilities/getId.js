module.exports = (function () {
  var c = 0;
  return function getId() {
    return (++c);
  };
});
