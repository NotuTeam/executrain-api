/** @format */

const mongoose = require("mongoose");

const testimonials_scheme = new mongoose.Schema({
  person_name: String,
  person_title: String,
  testimonial: String,
  photo: {
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

const Testimonial = mongoose.model("Testimonial", testimonials_scheme);

module.exports = Testimonial;
