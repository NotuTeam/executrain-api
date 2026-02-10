/** @format */

const Career = require("./model");
const CareerApplicant = require("./applicantModel");

const { upload, destroy } = require("../../lib/cd");

const apply_job = async (req, res) => {
  const {
    career_id,
    full_name,
    email,
    phone,
    cover_letter,
    portfolio_url,
    linkedin_url,
    github_url,
    experience_years,
    current_position,
    current_company,
    expected_salary,
    availability_date,
  } = req.body;

  try {
    // Check if career exists and is published
    const career = await Career.findById(career_id);
    if (!career) {
      return res.status(404).json({
        status: 404,
        message: "Career not found",
      });
    }

    if (career.status !== "PUBLISHED") {
      return res.status(400).json({
        status: 400,
        message: "This job posting is not accepting applications",
      });
    }

    // Check if deadline has passed
    if (career.application_deadline && new Date() > career.application_deadline) {
      return res.status(400).json({
        status: 400,
        message: "Application deadline has passed",
      });
    }

    // Check if user already applied
    const existingApplication = await CareerApplicant.findOne({
      career_id,
      email,
    });

    if (existingApplication) {
      return res.status(400).json({
        status: 400,
        message: "You have already applied for this position",
      });
    }

    let payload = {
      career_id,
      full_name,
      email,
      phone,
      cover_letter,
      portfolio_url,
      linkedin_url,
      github_url,
      experience_years: experience_years || 0,
      current_position,
      current_company,
      expected_salary,
      availability_date,
    };

    // Handle resume upload
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload.resume = {
        public_id: url_public,
        url: url_picture,
      };
    }

    const applicant = await CareerApplicant.create(payload);

    // Increment applicants count
    await Career.findByIdAndUpdate(career_id, {
      $inc: { applicants_count: 1 },
    });

    res.status(201).json({
      status: 201,
      message: "Application submitted successfully",
      data: applicant,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const applicants_list = async (req, res) => {
  try {
    const { career_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const sort_order = req.query.sort_order || "desc";
    const search = req.query.search;

    const filter = { career_id };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { current_position: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {
      applied_at: sort_order === "asc" ? 1 : -1,
    };

    const total_applicants = await CareerApplicant.countDocuments(filter);
    const total_pages = Math.ceil(total_applicants / limit);

    const applicants = await CareerApplicant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("career_id", "title department location");

    res.status(200).json({
      status: 200,
      message: "success",
      data: applicants,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_applicants: total_applicants,
        per_page: limit,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const applicant_detail = async (req, res) => {
  const { id } = req.params;

  try {
    const applicant = await CareerApplicant.findById(id).populate(
      "career_id",
      "title department location"
    );

    if (!applicant) {
      return res.status(404).json({
        status: 404,
        message: "Applicant not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: applicant,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const update_applicant_status = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const applicant = await CareerApplicant.findByIdAndUpdate(
      id,
      {
        status,
        notes,
        updated_at: Date.now(),
      },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({
        status: 404,
        message: "Applicant not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Applicant status updated successfully",
      data: applicant,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const delete_applicant = async (req, res) => {
  const { id } = req.params;

  try {
    const applicant = await CareerApplicant.findByIdAndDelete(id);

    if (!applicant) {
      return res.status(404).json({
        status: 404,
        message: "Applicant not found",
      });
    }

    // Destroy resume if exists
    if (applicant.resume && applicant.resume.public_id) {
      await destroy(applicant.resume.public_id);
    }

    // Decrement applicants count
    await Career.findByIdAndUpdate(applicant.career_id, {
      $inc: { applicants_count: -1 },
    });

    res.status(200).json({
      status: 200,
      message: "Applicant deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

module.exports = {
  apply_job,
  applicants_list,
  applicant_detail,
  update_applicant_status,
  delete_applicant,
};
