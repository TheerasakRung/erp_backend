require("dotenv").config();

const { Sequelize } = require('sequelize');

// // // in Sequelize(database name, username, password)
const sequelize = new Sequelize('ERP_DB', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  omitNull: true
});


// const sequelize = new Sequelize(
//   process.env.POSTGRESQL_HOST,
//   {
//       dialect: 'postgres',
//       omitNull: true,
//       dialectoptions: {
//           ssl: true
//       }
//   }
// )

module.exports = sequelize;


