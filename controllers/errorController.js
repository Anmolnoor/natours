const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
  //   next(error);
};

const handleDuplicatFieldsDB = (err) => {
  const value = err.errmsg.match(/(["])(\\?.)*?\1/)[0];
  const message = `Duplicate Field value ${value} Please use another value!!!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  console.log('====================================');
  console.log(err);
  console.log('====================================');
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid Input Data. ${errors.join('. ')} `;

  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  // oprational trusted error by api
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // non-oprational untrusted error by programming, thirdPartyLibrary or unhandler

    // 1) log err
    console.error('@@--ERROR--@@', err);
    // 2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Some thing went Wrong!!',
    });
  }
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'Production') {
    let errN = { ...err };
    if (err.name === 'CastError') errN = handleCastErrorDB(err);
    if (err.code === 11000) errN = handleDuplicatFieldsDB(err);
    if (err.name === 'ValidationError') errN = handleValidationError(err);

    sendErrorProd(errN, res);
  }
  //   next();
};
