/** @format */

const service = require("express").Router();

const {
  add,
  service_list,
  service_detail,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
service.get("/list", islogin, service_list);
service.get("/detail/:id", islogin, service_detail);
service.get("/public/list", service_list);

// POST
service.post("/add", islogin, add);

// PUT
service.put("/adjust/:id", islogin, adjust);

// DELETE
service.delete("/takedown/:id", islogin, takedown);

module.exports = service;
