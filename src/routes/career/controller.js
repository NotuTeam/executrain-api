/** @format */

const Career = require("./model");

const career_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const department = req.query.department;
    const location = req.query.location;
    const job_type = req.query.job_type;
    const experience_level = req.query.experience_level;
    const status = req.query.status;
    const sort_order = req.query.sort_order || "desc";
    const search = req.query.search;

    const filter = {};

    // For public endpoints, only show published jobs
    if (req.path.includes("/public/")) {
      filter.status = "PUBLISHED";
    } else if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (job_type) {
      filter.job_type = job_type;
    }

    if (experience_level) {
      filter.experience_level = experience_level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {
      created_at: sort_order === "asc" ? 1 : -1,
    };

    const total_careers = await Career.countDocuments(filter);
    const total_pages = Math.ceil(total_careers / limit);

    const careers = await Career.find(filter, {
      _id: 1,
      title: 1,
      slug: 1,
      description: 1,
      requirements: 1,
      experiance_requirement: 1,
      applicant_question: 1,
      location: 1,
      job_type: 1,
      experience_level: 1,
      salary_min: 1,
      salary_max: 1,
      salary_currency: 1,
      vacancies: 1,
      status: 1,
      created_at: 1,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: careers,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_careers: total_careers,
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

const career_detail = async (req, res) => {
  const { id } = req.params;

  try {
    const career = await Career.findByIdAndUpdate(
      { _id: id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!career) {
      return res.status(404).json({
        status: 404,
        message: "Career not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: career,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const career_by_slug = async (req, res) => {
  const { slug } = req.params;

  try {
    const career = await Career.findOneAndUpdate(
      { slug: slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!career) {
      return res.status(404).json({
        status: 404,
        message: "Career not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: career,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const add = async (req, res) => {
  const {
    title,
    description,
    requirements,
    experiance_requirement,
    applicant_question,
    location,
    job_type,
    experience_level,
    salary_min,
    salary_max,
    vacancies,
    status,
  } = req.body;

  try {
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure array fields are always arrays
    const requirementsArray = Array.isArray(requirements) ? requirements : requirements ? [requirements] : [];
    const experianceArray = Array.isArray(experiance_requirement) ? experiance_requirement : experiance_requirement ? [experiance_requirement] : [];
    const applicantArray = Array.isArray(applicant_question) ? applicant_question : applicant_question ? [applicant_question] : [];
    const descriptionArray = Array.isArray(description) ? description : description ? [description] : [];

    let payload = {
      title,
      slug,
      description: descriptionArray.filter(d => d && d.trim()),
      requirements: requirementsArray.filter(r => r && r.trim()),
      experiance_requirement: experianceArray.filter(e => e && e.trim()),
      applicant_question: applicantArray.filter(q => q && q.trim()),
      location,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      vacancies: vacancies || 1,
      status: status || "PUBLISHED", // Default ke PUBLISHED
    };

    const career = await Career.create(payload);

    res.status(201).json({
      status: 201,
      message: "success",
      data: career,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const adjust = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    requirements,
    experiance_requirement,
    applicant_question,
    location,
    job_type,
    experience_level,
    salary_min,
    salary_max,
    vacancies,
    status,
  } = req.body;

  try {
    // Ensure array fields are always arrays
    const requirementsArray = Array.isArray(requirements) ? requirements : requirements ? [requirements] : [];
    const experianceArray = Array.isArray(experiance_requirement) ? experiance_requirement : experiance_requirement ? [experiance_requirement] : [];
    const applicantArray = Array.isArray(applicant_question) ? applicant_question : applicant_question ? [applicant_question] : [];
    const descriptionArray = Array.isArray(description) ? description : [];

    let payload = {
      description: descriptionArray,
      requirements: requirementsArray.filter(r => r && r.trim()),
      experiance_requirement: experianceArray.filter(e => e && e.trim()),
      applicant_question: applicantArray.filter(q => q && q.trim()),
      location,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      vacancies,
      status,
      updated_at: Date.now(),
    };

    // Generate slug from title if changed
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      payload.title = title;
      payload.slug = slug;
    }

    const career = await Career.findByIdAndUpdate(id, payload, { new: true });

    if (!career) {
      return res.status(404).json({
        status: 404,
        message: "Career not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: `successfully update career ${id}`,
      data: career,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    const career = await Career.findByIdAndDelete(id);

    if (!career) {
      return res.status(404).json({
        status: 404,
        message: "Career not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: `successfully takedown career ${id}`,
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
  add,
  career_list,
  career_detail,
  career_by_slug,
  adjust,
  takedown,
};
