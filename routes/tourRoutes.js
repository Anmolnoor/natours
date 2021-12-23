const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const routes = express.Router();

// routes.param('id', tourControllwe.checkId);

routes
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createNewTour);

routes
  .route('/top-5-cheap/')
  .get(tourController.aliesTopTours, tourController.getAllTours);

routes.route('/tour-stats').get(tourController.getTourStats);
routes.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

routes
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.patchTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById
  );

module.exports = routes;
