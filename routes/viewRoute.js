const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/', viewController.overview);

router.get('/tours/:slug', viewController.tour);

router.get('/login', viewController.login);

module.exports = router;
