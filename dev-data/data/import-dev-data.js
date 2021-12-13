const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const dotenv = require('dotenv');

dotenv.config({ path: './../../config.env' });

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Script Connected to DB Successfully!!'))
  .catch((err) => console.error(err));

//   read files

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted Successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
