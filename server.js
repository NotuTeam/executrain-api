/** @format */

const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const bodyParser = require("body-parser");
const helmet = require("helmet");
const path = require("path");

const dbConnection = require("./src/config/db.js");
const { NODE_ENV, PORT, MONGO_URL } = require("./src/config/var.js");
const routes = require("./src/routes/index");
const ensureDbConnection = require("./src/middleware/dbGuard");

// Nodemon configuration for hot reload
if (NODE_ENV !== "production") {
  console.log("Development mode - Hot reload enabled");
}

const app = express();

// Middleware
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "/public")));

// CORS middleware for API routes
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

//enable cors
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

app.use(helmet());

//allow to access cookie
app.use(cookieParser());

//allow request with format x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//allow request with format json
app.use(bodyParser.json());

//file uploader handler
app.use(
  fileUpload({
    uploadTimeout: 60000,
  })
);

app.get("/", (_, res) => {
  res.json({
    message: "Welcom to Executrain API",
    createdBy: "ayamiyudin",
  });
});

// Middleware untuk ensure DB connection ready
app.use(ensureDbConnection);

app.use("/api/v1", routes);

app.get("*", (_, res) => {
  res.json({
    status: 404,
    message: "Endpoint not found",
  });
});

// Initialize database connection
dbConnection(MONGO_URL).catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// Untuk local development: start server dengan listen
// Untuk Vercel serverless: export app saja
if (NODE_ENV !== "production") {
  const server = createServer(app);
  server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
  });
}

module.exports = app;
