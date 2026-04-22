/** @format */

const freeTrial = require("express").Router();

const {
  add,
  product_list,
  product_detail,
  adjust,
  takedown,
  schedule_list,
  schedule_detail,
  add_schedule,
  add_schedule_bulk,
  adjust_schedule,
  takedown_schedule,
  schedule_by_product,
} = require("./controller");

const { islogin } = require("../../middleware/privilege");

// ==================== Product Routes ====================

// GET
freeTrial.get("/list", islogin, product_list);
freeTrial.get("/detail/:id", islogin, product_detail);
freeTrial.get("/public/list", product_list);
freeTrial.get("/public/detail/:id", product_detail);

// POST
freeTrial.post("/add", islogin, add);

// PUT
freeTrial.put("/adjust/:id", islogin, adjust);

// DELETE
freeTrial.delete("/takedown/:id", islogin, takedown);

// ==================== Schedule Routes ====================

// GET
freeTrial.get("/schedule/list", islogin, schedule_list);
freeTrial.get("/schedule/detail/:id", islogin, schedule_detail);
freeTrial.get("/schedule/public/list", schedule_list);
freeTrial.get("/schedule/public/detail/:id", schedule_detail);
freeTrial.get("/schedule/public/product/:product_id", schedule_by_product);

// POST
freeTrial.post("/schedule/add", islogin, add_schedule);
freeTrial.post("/schedule/add-bulk", islogin, add_schedule_bulk);

// PUT
freeTrial.put("/schedule/adjust/:id", islogin, adjust_schedule);

// DELETE
freeTrial.delete("/schedule/takedown/:id", islogin, takedown_schedule);

module.exports = freeTrial;
