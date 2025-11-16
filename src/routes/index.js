/** @format */

const routes = require("express").Router();

const auth = require("./auth");
const schedule = require("./schedule");
const page = require("./pages");
const product = require("./product");
const promo = require("./promo");
const partner = require("./partner");
const testimonial = require("./testimonial");
const statistic = require("./statistic");

routes.use("/auth", auth);
routes.use("/schedule", schedule);
routes.use("/page", page);
routes.use("/product", product);
routes.use("/promo", promo);
routes.use("/partner", partner);
routes.use("/testimonial", testimonial);
routes.use("/stat", statistic);

module.exports = routes;
