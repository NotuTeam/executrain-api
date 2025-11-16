/** @format */

const mongoose = require("mongoose");

const statistic_scheme = new mongoose.Schema({
  year_experience: Number,
  total_participant: Number,
  total_topic_class: Number,
  total_training_completed: Number,
  updated_at: {
    type: Date,
    default: new Date(),
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Statistic = mongoose.model("Statistic", statistic_scheme);

module.exports = Statistic;
