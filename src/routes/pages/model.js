/** @format */

const mongoose = require("mongoose");

const { STATUS } = require("../../config/enum");

const page_scheme = new mongoose.Schema({
  name: String,
  path: String,
  status: {
    type: String,
    enum: [STATUS.DRAFT, STATUS.PUBLISHED],
    default: STATUS.DRAFT,
  },
  template: {
    type: Array,
    default: [],
  },
  metadata: {
    type: Array,
    default: [],
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

const Page = mongoose.model("Page", page_scheme);

module.exports = Page;
