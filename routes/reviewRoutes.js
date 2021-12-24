const express = require('express');
const authController = require('../controllers/authController');

const reviewController = require('../controllers/reviewController');

const routes = express.Router({ mergeParams: true });

routes.use(authController.protect);

routes
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createNewReview
  );
routes
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = routes;
