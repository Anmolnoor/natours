const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

//  ---  Controller  ---
const globalErrorHandler = require('./controllers/errorController');

//   ---  Utils  ---
const AppError = require('./utils/appError');

//  ---  Mount router  ---
const routeTours = require('./routes/tourRoutes');
const routeUsers = require('./routes/userRoutes');

const app = express();

//  ---  middleware  ---
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  console.log('Hello from the server!!!');
  next();
});
app.use('/api/v1/tours', routeTours);
app.use('/api/v1/users', routeUsers);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
