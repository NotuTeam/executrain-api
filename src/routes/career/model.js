/** @format */

const mongoose = require("mongoose");

const {
  JOB_TYPE,
  EXPERIENCE_LEVEL,
  JOB_STATUS,
} = require("../../config/enum");

const career_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: [String],
    default: [],
  },
  requirements: {
    type: [String],
    default: [],
  },
  experiance_requirement: {
    type: [String],
    default: [],
  },
  applicant_question: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    required: true,
  },
  job_type: {
    type: String,
    enum: Object.values(JOB_TYPE),
    default: JOB_TYPE.FULL_TIME,
  },
  experience_level: {
    type: String,
    enum: Object.values(EXPERIENCE_LEVEL),
    default: EXPERIENCE_LEVEL.MID,
  },
  salary_min: {
    type: Number,
  },
  salary_max: {
    type: Number,
  },
  vacancies: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.DRAFT,
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

const Career = mongoose.model("Career", career_schema);

module.exports = Career;
