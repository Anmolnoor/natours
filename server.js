const mongoose = require('mongoose');
const app = require('./app');

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on ${port}...`);
    });
  })
  .catch((err) => console.error(err));
