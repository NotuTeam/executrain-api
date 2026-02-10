/** @format */

const mongoose = require("mongoose");

const {
  APPLICATION_STATUS,
  EXPERIENCE_LEVEL,
} = require("../../config/enum");

const careerApplicant_schema = new mongoose.Schema({
  career_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Career",
    required: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cover_letter: {
    type: String,
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolio_url: {
    type: String,
  },
  linkedin_url: {
    type: String,
  },
  github_url: {
    type: String,
  },
  experience_years: {
    type: Number,
    default: 0,
  },
  current_position: {
    type: String,
  },
  current_company: {
    type: String,
  },
  expected_salary: {
    type: Number,
  },
  availability_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.PENDING,
  },
  notes: {
    type: String,
  },
  applied_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
});

const CareerApplicant = mongoose.model("CareerApplicant", careerApplicant_schema);

module.exports = CareerApplicant;
