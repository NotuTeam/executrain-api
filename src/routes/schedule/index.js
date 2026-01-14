/** @format */

const schedule = require("express").Router();

const {
  add,
  add_bulk,
  schedule_list,
  schedule_public_list,
  schedule_home_list,
  schedule_calendar_list,
  schedule_detail,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
schedule.get("/list", islogin, schedule_list);
schedule.get("/detail/:id", islogin, schedule_detail);
schedule.get("/public/list", schedule_public_list);
schedule.get("/public/home", schedule_home_list);
schedule.get("/public/calendar", schedule_calendar_list);
schedule.get("/public/detail/:id", schedule_detail);

// POST
schedule.post("/add", islogin, add);
schedule.post("/add-bulk", islogin, add_bulk);

// PUT
schedule.put("/adjust/:id", islogin, adjust);

// DELETE
schedule.delete("/takedown/:id", islogin, takedown);

module.exports = schedule;
