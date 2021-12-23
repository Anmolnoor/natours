const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message); // eslint-disable-line no-console
  console.log('Unhandled Exception!!! :( Shutting Down The Server ...'); // eslint-disable-line no-console
  process.exit(1);
});

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB is Connected!!'); // eslint-disable-line no-console
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on ${port}...`); // eslint-disable-line no-console
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message); // eslint-disable-line no-console
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection!!! :( Shutting Down The Server ...');
  server.close(() => {
    process.exit(1);
  });
});
