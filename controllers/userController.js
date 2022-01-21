const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

// simple multerStorage for jus saving file as it is came from the user
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // in call back fxn you can pass error in 1-ARGUmnt or path in 2 ARGUmnt
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// saving the file into the memory of server to resize it
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a Image, Please upload image Only', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resixeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  // // eslint-disable-next-line no-console
  // console.log(req.file);
  // // eslint-disable-next-line no-console
  // console.log(req.body);

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
  if (req.file) filteredData.photo = req.file.filename;
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
