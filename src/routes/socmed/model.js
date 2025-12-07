/** @format */

const mongoose = require("mongoose");

const socmed_scheme = new mongoose.Schema({
  socmed_name: String,
  socmed_link: String,
  logo: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
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

const Socmed = mongoose.model("Socmed", socmed_scheme);

module.exports = Socmed;
