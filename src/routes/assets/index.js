/** @format */

const assets = require("express").Router();

const { asset_list, asset_detail, asset_all, adjust } = require("./controller");

const { islogin } = require("../../middleware/privilege");

// GET - public
assets.get("/list", asset_list);
assets.get("/all", asset_all);
assets.get("/detail/:category", asset_detail);

// PUT - protected
assets.put("/adjust/:id", islogin, adjust);

module.exports = assets;
