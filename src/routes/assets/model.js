/** @format */

const mongoose = require("mongoose");

const asset_scheme = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "hero_background",
      "hero_video",
      "about_image",
      "statistic_background",
      "steps_background",
      "services_image",
      "cta_schedule_image",
      "contact_image",
    ],
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    default: "",
  },
  fallback_url: {
    type: String,
    default: "",
  },
  fallback_public_id: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["image", "video"],
    default: "image",
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

const Asset = mongoose.model("Asset", asset_scheme);

module.exports = Asset;
