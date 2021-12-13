const express = require('express');

const tourControllwe = require('../controllers/tourController');

const routes = express.Router();

// routes.param('id', tourControllwe.checkId);

routes
  .route('/top-5-cheap/')
  .get(tourControllwe.aliesTopTours, tourControllwe.getAllTours);

routes
  .route('/')
  .get(tourControllwe.getAllTours)
  .post(tourControllwe.createNewTour);
routes
  .route('/:id')
  .get(tourControllwe.getTourById)
  .patch(tourControllwe.patchTourById)
  .delete(tourControllwe.deleteTourById);

module.exports = routes;
