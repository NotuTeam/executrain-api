/** @format */

const mongoose = require("mongoose");

const {
  FREE_TRIAL_CATEGORIES,
  SKILL_LEVELS,
  LANGUAGES,
} = require("../../config/enum");

// Extract category values from FREE_TRIAL_CATEGORIES array
const freeTrialCategoryValues = FREE_TRIAL_CATEGORIES.map((cat) =>
  Object.values(cat)[0]
);

// Extract skill level values from SKILL_LEVELS array
const skillLevelValues = SKILL_LEVELS.map((level) => Object.values(level)[0]);

// Extract language values from LANGUAGES array
const languageValues = LANGUAGES.map((lang) => Object.values(lang)[0]);

const free_trial_schema = new mongoose.Schema({
  product_name: String,
  product_description: String,
  max_participant: Number,
  link: String,
  duration: Number,
  benefits: {
    type: Array,
    default: [],
  },
  product_category: {
    type: String,
    enum: freeTrialCategoryValues,
    required: true,
  },
  skill_level: {
    type: String,
    enum: skillLevelValues,
    default: skillLevelValues[0],
  },
  language: {
    type: String,
    enum: languageValues,
    default: languageValues[0],
  },
  banner: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
  },
  learning_path_banner: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
  },
  learning_path_redirect_url: {
    type: String,
    default: "",
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

const FreeTrialProduct = mongoose.model(
  "FreeTrialProduct",
  free_trial_schema
);

module.exports = FreeTrialProduct;
