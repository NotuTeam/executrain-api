/** @format */

const mongoose = require("mongoose");

const { AVAILABILITY, SKILL_LEVELS, LANGUAGES } = require("../../config/enum");

const schedule_scheme = new mongoose.Schema({
  schedule_name: String,
  schedule_description: String,
  schedule_date: Date,
  schedule_close_registration_date: Date,
  schedule_start: String,
  schedule_end: String,
  location: String,
  quota: Number,
  duration: Number,
  is_assestment: Boolean,
  benefits: {
    type: Array,
    default: [],
  },
  link: String,
  skill_level: {
    type: String,
    enum: [
      SKILL_LEVELS.BEGINNER,
      SKILL_LEVELS.INTERMEDIATE,
      SKILL_LEVELS.EXPERT,
    ],
    default: SKILL_LEVELS.BEGINNER,
  },
  language: {
    type: String,
    enum: [LANGUAGES.INDONESIA, LANGUAGES.INGGRIS],
    default: LANGUAGES.INDONESIA,
  },
  status: {
    type: String,
    enum: [AVAILABILITY.FULL_BOOKED, AVAILABILITY.OPEN_SEAT],
    default: AVAILABILITY.OPEN_SEAT,
  },
  // Link schedule to product
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
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
