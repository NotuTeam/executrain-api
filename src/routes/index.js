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
const service = require("./services");
const socmed = require("./socmed");
const metadata = require("./metadata");
const assets = require("./assets");
const article = require("./article");
const career = require("./career");

routes.use("/auth", auth);
routes.use("/schedule", schedule);
routes.use("/page", page);
routes.use("/product", product);
routes.use("/promo", promo);
routes.use("/partner", partner);
routes.use("/testimonial", testimonial);
routes.use("/stat", statistic);
routes.use("/service", service);
routes.use("/socmed", socmed);
routes.use("/metadata", metadata);
routes.use("/assets", assets);
routes.use("/article", article);
routes.use("/career", career);

module.exports = routes;
