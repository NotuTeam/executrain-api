/** @format */

require("dotenv").config();

const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URL: process.env.MONGO_URL,
  MAX_AGE_ACCESS_TOKEN: process.env.MAX_AGE_ACCESS_TOKEN,
  MAX_AGE_REFRESH_TOKEN: process.env.MAX_AGE_REFRESH_TOKEN,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  GENESIS_PASSWORD: process.env.GENESIS_PASSWORD,
};

module.exports = config;
