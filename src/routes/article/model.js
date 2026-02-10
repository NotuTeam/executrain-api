/** @format */

const mongoose = require("mongoose");

const { ARTICLE_STATUS } = require("../../config/enum");

const article_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
  },
  author: {
    type: String,
    default: "Admin",
  },
  tags: {
    type: Array,
    default: [],
  },
  featured_image: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
  },
  status: {
    type: String,
    enum: Object.values(ARTICLE_STATUS),
    default: ARTICLE_STATUS.DRAFT,
  },
  views: {
    type: Number,
    default: 0,
  },
  meta_title: {
    type: String,
  },
  meta_description: {
    type: String,
  },
  meta_keywords: {
    type: Array,
    default: [],
  },
  published_at: {
    type: Date,
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

const Article = mongoose.model("Article", article_schema);

module.exports = Article;
