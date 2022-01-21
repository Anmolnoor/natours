const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const routes = express.Router();

// post /:tourId/reviews
// get /:tourId/reviews
// post /:tourId/reviews/:reviewId

// routes
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createNewReview
//   );
//  create a middleware to clean the routes to make them saprate from one another!!!

routes.use('/:tourId/reviews', reviewRouter);

// routes.param('id', tourControllwe.checkId);

routes
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createNewTour);

routes
  .route('/top-5-cheap/')
  .get(tourController.aliesTopTours, tourController.getAllTours);

routes.route('/tour-stats').get(tourController.getTourStats);
routes
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

routes
  .route('/tour-within/:distance/center/:latlan/unit/:unit')
  .get(tourController.getTourWithIn);

routes.route('/distance/:latlan/unit/:unit').get(tourController.getDistance);

routes
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.patchTourById
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById
  );

module.exports = routes;
