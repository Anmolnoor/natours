const express = require('express');

const tourControllwe = require('../controllers/tourController');

const routes = express.Router();

// routes.param('id', tourControllwe.checkId);

routes
  .route('/')
  .get(tourControllwe.getAllTours)
  .post(tourControllwe.createNewTour);

routes
  .route('/top-5-cheap/')
  .get(tourControllwe.aliesTopTours, tourControllwe.getAllTours);

routes.route('/tour-stats').get(tourControllwe.getTourStats);
routes.route('/monthly-plan/:year').get(tourControllwe.getMonthlyPlan);

routes
  .route('/:id')
  .get(tourControllwe.getTourById)
  .patch(tourControllwe.patchTourById)
  .delete(tourControllwe.deleteTourById);

module.exports = routes;
