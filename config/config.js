require('dotenv').config();

/**
 * I'm keeping this as an extra step between environment variables and loading
 * them, because it could later allow for further configuration of database
 * connections, which could be useful in development or testing.
 */
module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    dialect: 'mysql'
  },
  test: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    dialect: 'mysql'
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    dialect: 'mysql'
  }
};
