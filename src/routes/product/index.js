/** @format */

const product = require("express").Router();

const {
  add,
  product_list,
  product_detail,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
product.get("/list", islogin, product_list);
product.get("/detail/:id", islogin, product_detail);
product.get("/public/list", product_list);
product.get("/public/detail/:id", product_detail);

// POST;
product.post("/add", islogin, add);

// PUT;
product.put("/adjust/:id", islogin, adjust);

// DELETE
product.delete("/takedown/:id", islogin, takedown);

module.exports = product;
