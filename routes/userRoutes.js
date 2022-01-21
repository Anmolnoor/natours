const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const routes = express.Router();

routes.post('/signup', authController.signUp);
routes.post('/login', authController.login);
routes.post('/forgetPassword', authController.forgetPassword);
routes.patch('/resetPassword/:token', authController.resetPassword);

// to protect all routes after this middleware
routes.use(authController.protect);

routes.route('/me').get(userController.getMe, userController.getUser);

routes.patch('/updatePassword', authController.updatePassword);

routes.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resixeUserPhoto,
  userController.updateMe
);
routes.delete('/deleteMe', userController.deleteMe);

// to ristrict to all routes after this middleware
routes.use(authController.restrictTo('admin'));

routes
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

routes
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = routes;
