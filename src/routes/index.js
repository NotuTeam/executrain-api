/** @format */

const routes = require("express").Router();

const auth = require("./auth");
const schedule = require("./schedule");
const page = require("./pages");

routes.use("/auth", auth);
routes.use("/schedule", schedule);
routes.use("/page", page);

module.exports = routes;
