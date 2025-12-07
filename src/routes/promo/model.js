/** @format */

const mongoose = require("mongoose");

const promos_scheme = new mongoose.Schema({
  promo_name: String,
  promo_description: String,
  percentage: Number,
  end_date: Date,
  link: String,
  is_active: { type: Boolean, default: false },
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

const Promo = mongoose.model("Promo", promos_scheme);

module.exports = Promo;
