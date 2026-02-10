/** @format */

const article = require("express").Router();

const {
  add,
  article_list,
  article_detail,
  article_by_slug,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
article.get("/list", islogin, article_list);
article.get("/detail/:id", islogin, article_detail);
article.get("/public/list", article_list);
article.get("/public/detail/:id", article_detail);
article.get("/public/slug/:slug", article_by_slug);

// POST
article.post("/add", islogin, add);

// PUT
article.put("/adjust/:id", islogin, adjust);

// DELETE
article.delete("/takedown/:id", islogin, takedown);

module.exports = article;
