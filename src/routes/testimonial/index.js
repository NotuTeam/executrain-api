/** @format */

const testimonial = require("express").Router();

const {
  add,
  testimonial_list,
  testimonial_detail,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
testimonial.get("/list", islogin, testimonial_list);
testimonial.get("/detail/:id", islogin, testimonial_detail);
testimonial.get("/public/list", testimonial_list);

// POST;
testimonial.post("/add", islogin, add);

// PUT;
testimonial.put("/adjust/:id", islogin, adjust);

// DELETE
testimonial.delete("/takedown/:id", islogin, takedown);

module.exports = testimonial;
