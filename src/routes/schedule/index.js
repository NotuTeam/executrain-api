/** @format */

const schedule = require("express").Router();

const {
  add,
  add_bulk,
  schedule_list,
  schedule_detail,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
schedule.get("/list", islogin, schedule_list);
schedule.get("/detail/:id", islogin, schedule_detail);

// POST
schedule.post("/add", islogin, add);
schedule.post("/add-bulk", islogin, add_bulk);

// PUT
schedule.put("/adjust/:id", islogin, adjust);

// DELETE
schedule.delete("/takedown/:id", islogin, takedown);

module.exports = schedule;
