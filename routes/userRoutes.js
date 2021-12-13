const express = require('express');

const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const routes = express.Router();

routes.route('/').get(getAllUsers).post(createUser);
routes.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = routes;
