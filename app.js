const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//  ---   env   ---
dotenv.config({ path: './config.env' });

//  ---  Controller  ---
const globalErrorHandler = require('./controllers/errorController');

//   ---  Utils  ---
const AppError = require('./utils/appError');

//  ---  Mount router  ---
const routeTours = require('./routes/tourRoutes');
const routeUsers = require('./routes/userRoutes');
const routeReview = require('./routes/reviewRoutes');
const viewRoute = require('./routes/viewRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//  ---  Global-middleware  ---

// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again in an Hour!',
});
app.use('/api', limiter);

// Body parser and reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against the NoSql query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Perameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('Hello from the server!!!'); // eslint-disable-line no-console
  next();
});

//  ---   Routes   ---
app.use('/', viewRoute);
app.use('/api/v1/tours', routeTours);
app.use('/api/v1/users', routeUsers);
app.use('/api/v1/reviews', routeReview);

//  ---   error Handling ---
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

//  ---   Exports   ---
module.exports = app;
