/** @format */

const mongoose = require("mongoose");

const services_scheme = new mongoose.Schema({
  service_name: String,
  service_description: String,
  slug: {
    type: String,
    unique: true,
    immutable: true, // Cannot be changed once set
  },
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

// Generate slug before saving
services_scheme.pre("save", function (next) {
  if (this.isNew && this.service_name && !this.slug) {
    // Convert to lowercase and replace spaces with underscores
    this.slug = this.service_name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^\w_]/g, ""); // Remove special characters except underscores
  }
  next();
});

const Service = mongoose.model("Service", services_scheme);

module.exports = Service;
