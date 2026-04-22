/** @format */

const FreeTrialProduct = require("./model");
const FreeTrialSchedule = require("./schedule-model");

const { upload, destroy } = require("../../lib/cd");
const {
  deleteImageFromCDN,
  updateImageWithCleanup,
  cleanupImagesOnDelete,
} = require("../../lib/imageManager");
const { AVAILABILITY } = require("../../config/enum");

// Helper function to merge product data into schedule
const mergeProductData = async (schedules) => {
  if (!schedules || schedules.length === 0) return schedules;

  const productIds = [
    ...new Set(schedules.map((s) => s.product_id)),
  ];

  const products = await FreeTrialProduct.find({
    _id: { $in: productIds },
  });

  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  return schedules.map((schedule) => {
    const product =
      productMap[schedule.product_id?.toString() || schedule.product_id];
    if (product) {
      return {
        ...schedule.toObject(),
        schedule_description: product.product_description || "",
        benefits: product.benefits || [],
        link: product.link || "",
        skill_level: product.skill_level || "",
        language: product.language || "",
        product_name: product.product_name || "",
        product_banner: product.banner || null,
        product_description: product.product_description || "",
        product_link: product.link || "",
        product_category: product.product_category || "",
      };
    }
    return schedule;
  });
};

const product_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const product_category = req.query.product_category;
    const sort_order = req.query.sort_order || "desc";
    const product_name = req.query.product_name;

    const filter = {};

    if (product_category) {
      filter.product_category = product_category.toUpperCase();
    }

    if (product_name) {
      filter.product_name = { $regex: product_name, $options: "i" };
    }

    const sort = {
      created_at: sort_order === "asc" ? 1 : -1,
    };

    const total_products = await FreeTrialProduct.countDocuments(filter);
    const total_pages = Math.ceil(total_products / limit);

    const products = await FreeTrialProduct.find(filter, {
      _id: 1,
      product_name: 1,
      product_category: 1,
      skill_level: 1,
      max_participant: 1,
      duration: 1,
      product_description: 1,
      banner: 1,
      learning_path_banner: 1,
      learning_path_redirect_url: 1,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: products,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_products: total_products,
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

const product_detail = async (req, res) => {
  const { id } = req.params;

  try {
    FreeTrialProduct.findOne({ _id: id })
      .then((product) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: product,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Free Trial Product Found",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({
      status: 404,
      message: "server error",
    });
  }
};

const add = async (req, res) => {
  const {
    product_name,
    product_description,
    product_category,
    benefits,
    skill_level,
    language,
    max_participant,
    duration,
    link,
    learning_path_redirect_url,
  } = req.body;

  try {
    let payload = {
      product_name,
      product_description,
      product_category,
      benefits,
      skill_level,
      language,
      max_participant,
      duration,
      link: link || "",
      learning_path_redirect_url: learning_path_redirect_url || "",
    };

    // Handle banner upload
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    // Handle learning path banner upload
    if (req.files && req.files.learning_path_banner_file) {
      const { learning_path_banner_file } = req.files;
      const { url_picture, url_public } = await upload(
        learning_path_banner_file
      );

      payload["learning_path_banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    FreeTrialProduct.insertOne(payload)
      .then((page) => {
        res.status(201).json({
          status: 201,
          message: "success",
          data: page,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "failed to create a free trial product",
        });
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
    product_name,
    product_description,
    product_category,
    benefits,
    skill_level,
    language,
    max_participant,
    duration,
    link,
    learning_path_redirect_url,
  } = req.body;

  try {
    // Get existing product
    const existingProduct = await FreeTrialProduct.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Free Trial Product not found",
      });
    }

    let payload = {
      product_name,
      product_description,
      product_category,
      benefits,
      skill_level,
      language,
      max_participant,
      duration,
      link: link || "",
      learning_path_redirect_url: learning_path_redirect_url || "",
      updated_at: Date.now(),
    };

    // Handle banner upload with cleanup
    if (req.files && req.files.file) {
      payload.banner = await updateImageWithCleanup(
        existingProduct,
        "banner",
        req.files.file,
        "product"
      );
    } else if (req.body.banner && req.body.banner !== "undefined") {
      payload.banner = JSON.parse(req.body.banner);
    } else {
      if (existingProduct.banner && existingProduct.banner.public_id) {
        await deleteImageFromCDN(existingProduct.banner.public_id, "product");
      }
      payload.banner = {
        public_id: "",
        url: "",
      };
    }

    // Handle learning path banner upload with cleanup
    if (req.files && req.files.learning_path_banner_file) {
      payload.learning_path_banner = await updateImageWithCleanup(
        existingProduct,
        "learning_path_banner",
        req.files.learning_path_banner_file,
        "product"
      );
    } else if (
      req.body.learning_path_banner &&
      req.body.learning_path_banner !== "undefined"
    ) {
      payload.learning_path_banner = JSON.parse(req.body.learning_path_banner);
    } else {
      if (
        existingProduct.learning_path_banner &&
        existingProduct.learning_path_banner.public_id
      ) {
        await deleteImageFromCDN(
          existingProduct.learning_path_banner.public_id,
          "product"
        );
      }
      payload.learning_path_banner = {
        public_id: "",
        url: "",
      };
    }

    await FreeTrialProduct.updateOne({ _id: id }, payload);

    res.status(200).json({
      status: 200,
      message: `successfully update free trial product ${id}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    // Get existing product before delete
    const existingProduct = await FreeTrialProduct.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Free Trial Product not found",
      });
    }

    // Cleanup images from CDN
    await cleanupImagesOnDelete(
      existingProduct,
      ["banner", "learning_path_banner"],
      "product"
    );

    // Delete all schedules related to this free trial product
    const deletedSchedules = await FreeTrialSchedule.deleteMany({
      product_id: id,
    });
    console.log(
      `Deleted ${deletedSchedules.deletedCount} schedules related to free trial product ${id}`
    );

    // Delete from database
    await FreeTrialProduct.deleteOne({ _id: id });

    res.status(200).json({
      status: 200,
      message: `successfully takedown free trial product ${id} and ${deletedSchedules.deletedCount} related schedules`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

// ==================== Schedule Operations ====================

const schedule_list = async (req, res) => {
  try {
    const { search, product_id, schedule_category } = req.query;

    let filter = {};

    if (product_id) {
      filter.product_id = product_id;
    }

    if (schedule_category) {
      const scheduleCategories = Array.isArray(schedule_category)
        ? schedule_category
        : schedule_category
            .split(",")
            .map((cat) => cat.trim())
            .filter((cat) => cat !== "");

      if (scheduleCategories.length > 0) {
        filter.schedule_category = {
          $in: scheduleCategories,
        };
      }
    }

    if (search) {
      filter.schedule_name = {
        $regex: search,
        $options: "i",
      };
    }

    const schedules = await FreeTrialSchedule.find(filter, {
      _id: 1,
      schedule_name: 1,
      schedule_date: 1,
      schedule_close_registration_date: 1,
      status: 1,
      product_id: 1,
      schedule_start: 1,
      schedule_end: 1,
      location: 1,
      quota: 1,
      duration: 1,
      schedule_description: 1,
      schedule_category: 1,
    }).sort({ schedule_date: 1 });

    const schedulesWithProductData = await mergeProductData(schedules);

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedulesWithProductData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
      error: error.message,
    });
  }
};

const schedule_detail = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await FreeTrialSchedule.findOne({ _id: id });

    if (!schedule) {
      return res.status(200).json({
        status: 200,
        data: [],
        message: "No Free Trial Schedule Found",
      });
    }

    const schedulesWithProductData = await mergeProductData([schedule]);

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedulesWithProductData[0],
    });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({
      status: 404,
      message: "server error",
    });
  }
};

const add_schedule = async (req, res) => {
  const {
    schedule_name,
    schedule_category,
    schedule_date,
    schedule_close_registration_date,
    schedule_start,
    schedule_end,
    location,
    quota,
    duration,
    is_assestment,
    status,
    product_id,
  } = req.body;

  try {
    // Verify the product exists
    const product = await FreeTrialProduct.findById(product_id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Free Trial Product not found",
      });
    }

    let payload = {
      schedule_name,
      schedule_category,
      schedule_close_registration_date,
      schedule_date,
      schedule_start,
      schedule_end,
      location,
      quota,
      duration,
      is_assestment,
      status:
        status && status !== "-" ? status : AVAILABILITY.OPEN_SEAT,
      product_id,
    };

    FreeTrialSchedule.insertOne(payload)
      .then((schedule) => {
        res.status(201).json({
          status: 201,
          message: "success",
          data: schedule,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "failed to create a free trial schedule",
        });
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const add_schedule_bulk = async (req, res) => {
  const { data, product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      status: 400,
      message: "product_id is required for bulk schedule creation",
    });
  }

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "data must be a non-empty array",
    });
  }

  try {
    // Verify the product exists
    const product = await FreeTrialProduct.findById(product_id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Free Trial Product not found",
      });
    }

    const validStatuses = [AVAILABILITY.OPEN_SEAT, AVAILABILITY.FULL_BOOKED];

    const parseDateValue = (value) => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    };

    const payload = data
      .map((item) => {
        const statusValue = String(item.status || "").toUpperCase();

        return {
          schedule_name: String(item.schedule_name || "").trim(),
          schedule_category: item.schedule_category,
          schedule_close_registration_date: parseDateValue(
            item.schedule_close_registration_date
          ),
          schedule_date: parseDateValue(item.schedule_date),
          schedule_start: item.schedule_start,
          schedule_end: item.schedule_end,
          location: item.location,
          quota: Number(item.quota) || 0,
          duration: Number(item.duration) || 0,
          is_assestment: item.is_assestment === true || item.is_assestment === "true",
          status: validStatuses.includes(statusValue)
            ? statusValue
            : AVAILABILITY.OPEN_SEAT,
          product_id,
        };
      })
      .filter((item) => item.schedule_name);

    if (payload.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No valid schedules to import",
      });
    }

    FreeTrialSchedule.insertMany(payload)
      .then((insertedSchedules) => {
        res.status(201).json({
          status: 201,
          message: "success",
          data: insertedSchedules,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "failed to do bulk create free trial schedule",
        });
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const adjust_schedule = async (req, res) => {
  const { id } = req.params;
  const {
    schedule_name,
    schedule_category,
    schedule_date,
    schedule_close_registration_date,
    schedule_start,
    schedule_end,
    location,
    quota,
    duration,
    is_assestment,
    status,
    product_id,
  } = req.body;

  try {
    let payload = {
      schedule_name,
      schedule_category,
      schedule_date,
      schedule_close_registration_date,
      schedule_start,
      schedule_end,
      location,
      quota,
      duration,
      is_assestment,
      status,
      product_id,
      updated_at: Date.now(),
    };

    FreeTrialSchedule.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update free trial schedule ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "free trial schedule not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update free trial schedule",
    });
  }
};

const takedown_schedule = async (req, res) => {
  const { id } = req.params;
  try {
    FreeTrialSchedule.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown free trial schedule ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "free trial schedule not found",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const schedule_by_product = async (req, res) => {
  try {
    const { product_id } = req.params;
    const limit = parseInt(req.query.limit) || 3;

    if (!product_id) {
      return res.status(400).json({
        status: 400,
        message: "product_id is required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projection = {
      _id: 1,
      schedule_name: 1,
      schedule_date: 1,
      schedule_close_registration_date: 1,
      status: 1,
      product_id: 1,
      schedule_start: 1,
      schedule_end: 1,
      location: 1,
      quota: 1,
      duration: 1,
      schedule_description: 1,
      schedule_category: 1,
    };

    const upcomingSchedules = await FreeTrialSchedule.find(
      {
        product_id: product_id,
        schedule_date: { $gte: today },
      },
      projection
    ).sort({ schedule_date: 1 });

    const fallbackSchedules = await FreeTrialSchedule.find(
      {
        product_id: product_id,
        $or: [
          { schedule_date: { $lt: today } },
          { schedule_date: null },
          { schedule_date: { $exists: false } },
        ],
      },
      projection
    ).sort({ schedule_date: -1 });

    const schedules = [...upcomingSchedules, ...fallbackSchedules].slice(0, limit);

    const schedulesWithProductData = await mergeProductData(schedules);

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedulesWithProductData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
      error: error.message,
    });
  }
};

module.exports = {
  add,
  product_list,
  product_detail,
  adjust,
  takedown,
  // Schedule operations
  schedule_list,
  schedule_detail,
  add_schedule,
  add_schedule_bulk,
  adjust_schedule,
  takedown_schedule,
  schedule_by_product,
};
