function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next); // Shorter and correct syntax
  };
}

module.exports = wrapAsync;

