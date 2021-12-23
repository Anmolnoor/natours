const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const routes = express.Router();

routes.post('/signup', authController.signUp);
routes.post('/login', authController.login);

routes.post('/forgetPassword', authController.forgetPassword);
routes.patch('/resetPassword/:token', authController.resetPassword);
routes.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

routes.patch('/updateMe', authController.protect, userController.updateMe);
routes.delete('/deleteMe', authController.protect, userController.deleteMe);

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
