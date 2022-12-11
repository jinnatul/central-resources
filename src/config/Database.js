import Sequelize from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

// const sequelize = new Sequelize(process.env.DB_NAME, null, null, {
//   dialect: process.env.DB_DIALECT,
//   replication: {
//     read: [
//       {
//         host: process.env.HOST_READ_REPLICA,
//         username: process.env.DB_USER,
//         password: process.env.DB_PASS,
//       },
//     ],
//     write: {
//       host: process.env.HOST,
//       username: process.env.DB_USER,
//       password: process.env.DB_PASS,
//     },
//   },
//   logging: false,
//   pool: {
//     max: 30,
//     min: 0,
//     acquire: 600000,
//     idle: 10000,
//   },
// });

export default sequelize;
