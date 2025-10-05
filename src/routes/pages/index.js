/** @format */

const schedule = require("express").Router();

const {
  add,
  page_list,
  page_detail,
  page_layout,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
schedule.get("/list", islogin, page_list);
schedule.get("/detail/:id", islogin, page_detail);
schedule.get("/public/:path", page_layout);

// POST
schedule.post("/add", islogin, add);

// PUT
schedule.put("/adjust/:id", islogin, adjust);

// DELETE
schedule.delete("/takedown/:id", islogin, takedown);

module.exports = schedule;
