/** @format */

const mongoose = require("mongoose");
const dbConnection = require("../config/db");
const { MONGO_URL } = require("../config/var");

// Middleware untuk memastikan DB connection ready sebelum handle request
const ensureDbConnection = async (req, res, next) => {
  try {
    // Skip check untuk endpoint health check
    if (req.path === "/" || req.path === "/health") {
      return next();
    }

    // Check connection state
    const state = mongoose.connection.readyState;

    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Already connected
      return next();
    }

    if (state === 2) {
      // Currently connecting, wait untuk connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 5000);

        mongoose.connection.once("connected", () => {
          clearTimeout(timeout);
          resolve();
        });

        mongoose.connection.once("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      return next();
    }

    // Disconnected or disconnecting, reconnect
    console.log("DB not connected, attempting to connect...");
    await dbConnection(MONGO_URL);
    return next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    return res.status(503).json({
      status: 503,
      message: "Database connection unavailable",
      error: error.message,
    });
  }
};

module.exports = ensureDbConnection;
