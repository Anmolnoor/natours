const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/email');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECERT, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //  cookie with http only for browser interaction
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //  remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    passwordChangedAT: req.body.passwordChangedAT,
  });
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide the email!! and password!!'), 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email and Password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // console.log('decode'); // eslint-disable-line no-console

  let token;
  //  verify the token from the headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token); // eslint-disable-line no-console

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get Access!')
    );
  }
  // decode the token to check it is still worthy or not
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECERT);
  // console.log(decode); // eslint-disable-line no-console

  //   check if user still exist

  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The User Belonging to this token does no longer exist!!!.',
        401
      )
    );
  }
  //   console.log(await freshUser.changedPasswordAfter(decode.iat)); // eslint-disable-line
  //   if password is changed by the user after the current token
  if (await freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(
        'User recently changed password!, Please login Again!!!',
        401
      )
    );
  }
  //   grant acces tp protected route
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on email ID

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with this email address.', 404));

  // 2) generate the random reset token
  const resetToken = user.createRandomPasswordToken();
  user.save({ validateBeforeSave: false });

  // 3) send the token by email to the user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Submit a patch request with your new password and passwordCoonfirm to :\n${resetUrl}\nIf you didn't forget your password, please ignore this email!!`;

  try {
    // console.log('sending email'); // eslint-disable-line
    // const emailSent =
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (Valid for 10 minutes only)',
      message: message,
    });

    // console.log(emailSent); // eslint-disable-line

    res.status(200).json({
      status: 'succes',
      message: 'Token sent to email!!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpTime = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was a error sending the email.Try again Later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based ono the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpTime: { $gt: Date.now() },
  });

  //  2) If token is not expired, and there is a User, set new password
  if (!user) {
    return next(new AppError('Token is Invalid or has Expired', 400));
  }

  //  3) Update the changed password At property  for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpTime = undefined;
  await user.save();

  //  4) Login the user , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  1)  get user from the collections
  const user = await User.findOne(req.user._id).select('+password');

  //  2)  check if Posted Password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    next(new AppError('Your current Password Wrong!!!', 401));
  }
  //  3)  if So , update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  // console.log(token); // eslint-disable-line
  createSendToken(user, 200, res);
});
