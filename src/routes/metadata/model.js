/** @format */

const mongoose = require("mongoose");

const { STATUS } = require("../../config/enum");

const metadata_scheme = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ["home", "about", "contact", "product", "schedule", "service"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    default: [],
  },
  canonical_url: String,
  og_title: String,
  og_description: String,
  og_image: String,
  og_type: {
    type: String,
    default: "website",
  },
  twitter_card: {
    type: String,
    default: "summary_large_image",
  },
  twitter_title: String,
  twitter_description: String,
  twitter_image: String,
  author: String,
  language: {
    type: String,
    default: "id",
  },
  viewport: {
    type: String,
    default: "width=device-width, initial-scale=1.0",
  },
  robots: {
    index: {
      type: Boolean,
      default: true,
    },
    follow: {
      type: Boolean,
      default: true,
    },
  },
  json_ld: {
    type: Object,
    default: null,
  },
  status: {
    type: String,
    enum: [STATUS.DRAFT, STATUS.PUBLISHED],
    default: STATUS.DRAFT,
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

const Metadata = mongoose.model("Metadata", metadata_scheme);

module.exports = Metadata;
