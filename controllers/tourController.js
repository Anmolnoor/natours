const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliesTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAvarage,price';
  req.query.fields = 'name,duration,difficulty,price,ratingsAverage,summary';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTourById = factory.getOne(Tour, 'reviews');

exports.createNewTour = factory.createOne(Tour);

exports.patchTourById = factory.updateOne(Tour);

exports.deleteTourById = factory.deleteOne(Tour);

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

// to upload a single file use upload.single("fieldNameFromForm")
// to upload a multiple files with a sameFieldName use upload.array("fieldNameFromForm")
// to upload a multiple files with different fields name you can use the following method

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files); // eslint-disable-line no-console
  if (!req.files.imageCover || !req.files.images) return next();
  // imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //  images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    })
  );

  console.log(req.body); // eslint-disable-line
  next();
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});

exports.getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlan, unit } = req.params;
  const [lat, lan] = latlan.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lan) {
    next(
      new AppError(
        'Please provide latitude and longitude in format of lat,lan.',
        400
      )
    );
  }

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lan, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    tours: tour.length,
    data: tour,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlan, unit } = req.params;

  const [lat, lan] = latlan.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lan) {
    next(
      new AppError(
        'Please provide latitude and longitude in format of lat,lan.',
        400
      )
    );
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lan * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: distance,
  });
});
