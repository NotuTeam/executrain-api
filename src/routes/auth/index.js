/** @format */

const auth = require("express").Router();

const {
  genesis,
  login,
  refresh,
  user_list,
  register,
  adjust,
  takedown,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET
auth.get("/genesis", genesis);
auth.get("/refresh", islogin, refresh);
auth.get("/list", user_list);

// POST
auth.post("/login", login);
auth.post("/register", register);

// PUT
auth.put("/adjust/:id", islogin, adjust);

// DELETE
auth.delete("/takedown/:id", islogin, takedown);

module.exports = auth;
