/** @format */

const mongoose = require("mongoose");

const { ROLE, GENDER } = require("../../config/enum");

const user_scheme = new mongoose.Schema({
  username: String,
  display_name: String,
  password: String,
  role: {
    type: String,
    enum: [ROLE.SUPERADMIN, ROLE.ADMIN],
    default: ROLE.ADMIN,
  },
  gender: {
    type: String,
    enum: [GENDER.M, GENDER.F, GENDER.DEFAULT],
    default: GENDER.DEFAULT,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const User = mongoose.model("User", user_scheme);

module.exports = User;
