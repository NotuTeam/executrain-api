/** @format */

const page = require("express").Router();

const {
  add,
  page_list,
  page_detail,
  page_layout,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
page.get("/list", islogin, page_list);
page.get("/detail/:id", islogin, page_detail);
page.get("/public/:path", page_layout);

// POST
page.post("/add", islogin, add);

// PUT
page.put("/adjust/:id", islogin, adjust);

// DELETE
page.delete("/takedown/:id", islogin, takedown);

module.exports = page;
