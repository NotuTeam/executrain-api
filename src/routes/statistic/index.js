/** @format */

const statistic = require("express").Router();

const { statistic_detail, adjust } = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
statistic.get("/detail", statistic_detail);

// PUT;
statistic.put("/adjust", islogin, adjust);

module.exports = statistic;
