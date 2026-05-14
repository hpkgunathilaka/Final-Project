function notFound(req, res, next) {
  res.status(404);
  next(new Error('Not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;

  const payload = {
    message: err.message || 'Server error'
  };

  if (err.errors && typeof err.errors === 'object') {
    payload.errors = err.errors;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
