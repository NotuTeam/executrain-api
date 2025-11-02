/** @format */

const promo = require("express").Router();

const {
  add,
  promo_list,
  promo_detail,
  promo_active,
  adjust,
  activate_promo,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
promo.get("/list", islogin, promo_list);
promo.get("/public/promo", promo_active);

// POST;
promo.post("/add", islogin, add);

// PUT;
promo.put("/adjust/:id", islogin, adjust);
promo.put("/active/:id", islogin, activate_promo);

// DELETE
promo.delete("/takedown/:id", islogin, takedown);

module.exports = promo;
