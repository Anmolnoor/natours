const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this is only work for the create and save user methods!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAT: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpTime: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// hook on save or create to hash the password for the database..!

userSchema.pre('save', async function (next) {
  // run this function only if the password was actually modified
  if (!this.isModified('password')) return next();
  // hash the password with the cost of 12 in bcryptjs
  this.password = await bcrypt.hash(this.password, 12);
  // delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAT = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //  this point to the current query
  this.find({ active: { $ne: false } });
  next();
});

// schema methods to make the model more faty and controller more slim

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTime) {
  if (this.passwordChangedAT) {
    const timeStemp = parseInt(this.passwordChangedAT.getTime() / 1000, 10);
    return JWTTime < timeStemp; // 100 > 200
  }
  return false;
};

userSchema.methods.createRandomPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpTime = Date.now() + 10 * 60 * 1000;

  //eslint-disable-next-line no-console
  console.log(
    { randomToken: resetToken },
    this.passwordResetToken,
    Date.now(),
    this.passwordResetExpTime
  );

  return resetToken;
};

const User = mongoose.model('Users', userSchema);

module.exports = User;
