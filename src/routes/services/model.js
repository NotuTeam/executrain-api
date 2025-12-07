/** @format */

const mongoose = require("mongoose");

const services_scheme = new mongoose.Schema({
  service_name: String,
  service_description: String,
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

const Service = mongoose.model("Service", services_scheme);

module.exports = Service;
