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
  CDN_CLOUD_NAME: process.env.CDN_CLOUD_NAME,
  CDN_API_KEY: process.env.CDN_API_KEY,
  CDN_API_SECRET: process.env.CDN_API_SECRET,
  SMTP_GMAIL_USER: process.env.SMTP_GMAIL_USER,
  SMTP_GMAIL_APP_PASSWORD: process.env.SMTP_GMAIL_APP_PASSWORD,
  SMTP_GMAIL_FROM_NAME: process.env.SMTP_GMAIL_FROM_NAME,
};

module.exports = config;
