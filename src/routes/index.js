/** @format */

const routes = require("express").Router();

const auth = require("./auth");
const schedule = require("./schedule");
const page = require("./pages");
const product = require("./products");
const promo = require("./promo");

routes.use("/auth", auth);
routes.use("/schedule", schedule);
routes.use("/page", page);
routes.use("/product", product);
routes.use("/promo", promo);

module.exports = routes;
