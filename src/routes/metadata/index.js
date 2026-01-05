/** @format */

const metadata = require("express").Router();

const {
  metadata_list,
  metadata_by_page,
  metadata_detail,
  add,
  adjust,
  change_status,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
metadata.get("/list", islogin, metadata_list);
metadata.get("/detail/:id", islogin, metadata_detail);
metadata.get("/public/:page", metadata_by_page);

// POST
metadata.post("/add", islogin, add);

// PUT
metadata.put("/adjust/:id", islogin, adjust);
metadata.put("/publish/:id", islogin, change_status);

// DELETE
metadata.delete("/takedown/:id", islogin, takedown);

module.exports = metadata;
