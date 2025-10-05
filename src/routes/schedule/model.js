/** @format */

const mongoose = require("mongoose");

const { PRIORITY } = require("../../config/enum");

const schedule_scheme = new mongoose.Schema({
  title: String,
  description: String,
  password: String,
  date: Date,
  time: String,
  duration: Number,
  location: String,
  quota: Number,
  type: String,
  priority: {
    type: String,
    enum: [PRIORITY.HIGH, PRIORITY.MEDIUM, PRIORITY.LOW],
    default: PRIORITY.LOW,
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Schedule = mongoose.model("Schedule", schedule_scheme);

module.exports = Schedule;
