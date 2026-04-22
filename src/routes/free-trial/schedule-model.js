/** @format */

const mongoose = require("mongoose");

const { AVAILABILITY } = require("../../config/enum");

const free_trial_schedule_schema = new mongoose.Schema({
  schedule_name: String,
  schedule_description: String,
  schedule_category: String,
  schedule_date: Date,
  schedule_close_registration_date: Date,
  schedule_start: String,
  schedule_end: String,
  location: String,
  quota: Number,
  duration: Number,
  is_assestment: Boolean,
  status: {
    type: String,
    enum: [AVAILABILITY.FULL_BOOKED, AVAILABILITY.OPEN_SEAT],
    default: AVAILABILITY.OPEN_SEAT,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FreeTrialProduct",
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

const FreeTrialSchedule = mongoose.model(
  "FreeTrialSchedule",
  free_trial_schedule_schema
);

module.exports = FreeTrialSchedule;
