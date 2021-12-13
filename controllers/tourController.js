// const fs = require('fs');
const APIFeatures = require('../utils/apiFeatures');

const aliesTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAvarage,price';
  req.query.fields = 'name,duration,difficulty,price,ratingsAverage,summary';
  next();
};

const Tour = require('../models/tourModel');

const getAllTours = async (req, res) => {
  try {
    // Executing query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;
    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

const createNewTour = async (req, res) => {
  try {
    const data = req.body;
    const newTour = await Tour.create(data);
    res.status(201).json({
      status: 'Success',
      data: newTour,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
  // const newId = tours[tours.length - 1].id + 1;
  // const tour = { id: newId, ...data };
  //
  // tours.push(tour);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     if (err) res.status(404).json({ status: 'Failed', message: err.message });
  //     const newTour = tours[tours.length - 1];
  // res.status(201).json({
  //   status: 'Success',
  //   data: newTour,
  // });
  //   }
  // );
};

const patchTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }

  // const data = req.body;
  // console.log(data);
  // const id = req.params.id * 1;

  // const tour = tours.find((el) => el.id === id);
  // const updatedT = { ...tour, ...data };
  // const updatedTour = tours.map((item) =>
  // updatedT.id === item.id ? updatedT : item
  // );
  // console.log(updatedTour);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(updatedTour),
  //   (err) => {
  //     if (err) res.status(404).json({ status: 'Failed', message: err.message });
  // res.status(200).json({
  //   status: 'Success',
  // data: { ...data },
  // });
  //   }
  // );
};

const deleteTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
  // const id = req.params.id * 1;
  // const updatedTour = tours.filter((item) => id !== item.id);
  //   console.log(updatedTour);
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(updatedTour),
  //   (err) => {
  //     if (err) res.status(404).json({ status: 'Failed', message: err.message });
  //     res.status(204).json({
  //       status: 'Success',
  //       data: null,
  //     });
  //   }
  // );
};

module.exports = {
  createNewTour,
  deleteTourById,
  getAllTours,
  getTourById,
  patchTourById,
  aliesTopTours,
};
