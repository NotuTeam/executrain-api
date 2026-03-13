/** @format */

const mongoose = require("mongoose");

const career_gallery_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
  },
  order: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
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

const CareerGallery = mongoose.model("CareerGallery", career_gallery_schema);

module.exports = CareerGallery;
