/** @format */

const mongoose = require("mongoose");

const partners_scheme = new mongoose.Schema({
  partner_name: String,
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

const Partner = mongoose.model("Partner", partners_scheme);

module.exports = Partner;
