/** @format */

const career = require("express").Router();

const {
  add,
  career_list,
  career_detail,
  career_by_slug,
  adjust,
  takedown,
} = require("./controller");

const {
  apply_job,
  applicants_list,
  applicant_detail,
  update_applicant_status,
  delete_applicant,
} = require("./applicantController");

const { islogin } = require("../../middleware/privilege");

// GET - Career Listings
career.get("/list", islogin, career_list);
career.get("/detail/:id", islogin, career_detail);
career.get("/public/list", career_list);
career.get("/public/detail/:id", career_detail);
career.get("/public/slug/:slug", career_by_slug);

// GET - Applicants (Protected)
career.get("/:career_id/applicants", islogin, applicants_list);
career.get("/applicant/:id", islogin, applicant_detail);

// POST - Career Management (Protected)
career.post("/add", islogin, add);

// POST - Apply for Job (Public)
career.post("/apply", apply_job);

// PUT - Career Management (Protected)
career.put("/adjust/:id", islogin, adjust);

// PUT - Update Applicant Status (Protected)
career.put("/applicant/:id/status", islogin, update_applicant_status);

// DELETE - Career Management (Protected)
career.delete("/takedown/:id", islogin, takedown);

// DELETE - Applicant Management (Protected)
career.delete("/applicant/:id", islogin, delete_applicant);

module.exports = career;
