/** @format */

const mongoose = require("mongoose");

const { CATEGORIES, SKILL_LEVELS, LANGUAGES } = require("../../config/enum");

const products_scheme = new mongoose.Schema({
  product_name: String,
  product_description: String,
  max_participant: Number,
  instructors: Number,
  instructor_list: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        photo: {
          type: Object,
          default: {
            public_id: "",
            url: "",
          },
        },
      },
    ],
    default: [],
  },
  link: String,
  duration: Number,
  benefits: {
    type: Array,
    default: [],
  },
  product_category: {
    type: String,
    enum: [
      CATEGORIES.IT_TRAINING,
      CATEGORIES.IT_CONSULTANT,
      CATEGORIES.IT_SUPPORT,
    ],
    default: CATEGORIES.IT_TRAINING,
  },
  skill_level: {
    type: String,
    enum: [
      SKILL_LEVELS.BEGINNER,
      SKILL_LEVELS.INTERMEDIATE,
      SKILL_LEVELS.EXPERT,
    ],
    default: SKILL_LEVELS.BEGINNER,
  },
  language: {
    type: String,
    enum: [LANGUAGES.INDONESIA, LANGUAGES.INGGRIS],
    default: LANGUAGES.INDONESIA,
  },
  banner: {
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

const Product = mongoose.model("Product", products_scheme);

module.exports = Product;
