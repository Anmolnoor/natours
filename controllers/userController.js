const User = require('../models/userModel');
const factory = require('./handlerFactory');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet define!!! and Please use /signUp instead',
  });
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //  1) create a error if user add the password data
  if (req.body.newPassword || req.body.newPasswordConfirm) {
    return next(
      new AppError(
        'This route is not for Password Updates. Please use /updatePassword',
        400
      )
    );
  }
  //   2) filtered out unwanted fields name that are not allowed to be updated
  const filteredData = filterObj(req.body, 'name', 'email');
  // console.log(filteredData); // eslint-disable-line
  //  3) update user data
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    ststus: 'success',
    user: updateUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    user: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// this is only for the Admin and don't update the user password with this one

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
