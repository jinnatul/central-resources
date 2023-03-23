const app = require('./app');
const sequelize = require('./config/database');

// Db connection
sequelize
  // .sync() // only use when you need to create table using model
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Failed!!! Please check your connection credentials!');
  });

// Express server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`The server is running on port ${port} in ${process.env.STAGE} mode`);
});
