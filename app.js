const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

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

app.use('/api/v1/tours', routeTours);
app.use('/api/v1/users', routeUsers);

module.exports = app;
