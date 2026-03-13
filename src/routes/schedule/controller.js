/** @format */

const Schedule = require("./model");
const Product = require("../product/model");

const { upload, destroy } = require("../../lib/cd");

const { AVAILABILITY } = require("../../config/enum");

// Helper function to merge product data into schedule
const mergeProductData = async (schedules) => {
  if (!schedules || schedules.length === 0) return schedules;

  // Get all unique product IDs
  const productIds = [...new Set(schedules.map(s => s.product_id))];

  // Fetch all products in one query
  const products = await Product.find({
    _id: { $in: productIds }
  });

  // Create product map for quick lookup
  const productMap = {};
  products.forEach(p => {
    productMap[p._id.toString()] = p;
  });

  // Merge product data into each schedule
  return schedules.map(schedule => {
    const product = productMap[schedule.product_id?.toString() || schedule.product_id];
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
        product_category: product.product_category || ""
      };
    }
    return schedule;
  });
};

const schedule_list = async (req, res) => {
  try {
    const { search, date, product_id, schedule_category, product_category } = req.query;

    let filter = {};

    // Filter by product_id if provided
    if (product_id) {
      filter.product_id = product_id;
    }

    // Filter by schedule_category if provided (supports multiple values)
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

    // Jika ada pencarian
    if (search) {
      filter.schedule_name = {
        $regex: search,
        $options: "i",
      };

      filter.schedule_date = {
        $gte: new Date(),
      };
    }
    // Jika tidak ada search dan tidak ada date, tampilkan semua data
    // (tidak ada filter tambahan)

    const schedules = await Schedule.find(filter, {
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
    })
      .sort({ schedule_date: 1 });

    // Merge product data into schedules
    let schedulesWithProductData = await mergeProductData(schedules);

    // Filter by product_category if provided (after merging product data)
    if (product_category) {
      schedulesWithProductData = schedulesWithProductData.filter(
        schedule => schedule.product_category === product_category
      );
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedulesWithProductData,
      filters: {
        search: search || null,
        date: date || null,
        product_id: product_id || null,
        schedule_category: schedule_category || null,
        product_category: product_category || null,
        ...(search && {
          info: "Menampilkan agenda aktif dan akan datang",
        }),
        ...(!search &&
          !date && {
            info: "Menampilkan semua agenda",
          }),
      },
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

const schedule_public_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const { search, schedule_category, product_category } = req.query;

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

    let filter = {};
    if (search) {
      filter.schedule_name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by schedule_category if provided (supports multiple values)
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

    const upcomingFilter = { ...filter, schedule_date: { $gte: today } };
    const upcomingSchedules = await Schedule.find(
      upcomingFilter,
      projection,
    )
      .sort({ schedule_date: 1 });

    const pastFilter = { ...filter, schedule_date: { $lt: today } };
    const pastSchedules = await Schedule.find(pastFilter, projection)
      .sort({
        schedule_date: -1,
      });

    const allSchedules = [...upcomingSchedules, ...pastSchedules];

    // Merge product data into schedules
    let schedulesWithProductData = await mergeProductData(allSchedules);

    // Filter by product_category if provided (after merging product data)
    if (product_category) {
      schedulesWithProductData = schedulesWithProductData.filter(
        schedule => schedule.product_category === product_category
      );
    }

    const total_schedules = schedulesWithProductData.length;
    const total_pages = Math.ceil(total_schedules / limit);
    const paginatedSchedules = schedulesWithProductData.slice(skip, skip + limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: paginatedSchedules,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_schedules: total_schedules,
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
      error: error.message,
    });
  }
};

const schedule_home_list = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await Schedule.find(
      { schedule_date: { $gte: today } },
      {
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
      },
    )
      .sort({ schedule_date: 1 })
      .limit(limit);

    // Merge product data into schedules
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

    const schedules = await Schedule.find(
      {
        product_id: product_id,
        schedule_date: { $gte: today },
      },
      {
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
      },
    )
      .sort({ schedule_date: 1 })
      .limit(limit);

    // Merge product data into schedules
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

const schedule_calendar_list = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        status: 400,
        message: "year and month are required",
      });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const schedules = await Schedule.find(
      {
        schedule_date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
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
      },
    )
      .sort({ schedule_date: 1 });

    // Merge product data into schedules
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
    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
      return res.status(200).json({
        status: 200,
        data: [],
        message: "No Schedule Found",
      });
    }

    // Merge product data into schedule
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

const add = async (req, res) => {
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
      schedule_close_registration_date,
      schedule_date,
      schedule_start,
      schedule_end,
      location,
      quota,
      duration,
      is_assestment,
      status: status && status !== "-" ? status : AVAILABILITY.OPEN_SEAT,
      product_id,
    };

    Schedule.insertOne(payload)
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
          message: "failed to create an schedule",
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

const add_bulk = async (req, res) => {
  const { data, product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      status: 400,
      message: "product_id is required for bulk schedule creation",
    });
  }

  const payload = data.map((item) => ({
    schedule_name: item.schedule_name,
    schedule_category: item.schedule_category,
    schedule_close_registration_date: item.schedule_close_registration_date,
    schedule_date: item.schedule_date,
    schedule_start: item.schedule_start,
    schedule_end: item.schedule_end,
    location: item.location,
    quota: item.quota,
    duration: item.duration,
    is_assestment: item.is_assestment,
    status:
      item.status && item.status !== "-" ? item.status : AVAILABILITY.OPEN_SEAT,
    product_id,
  }));

  try {
    Schedule.insertMany(payload)
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
          message: "failed to do bulk create schedule",
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

    Schedule.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update schedule ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "schedule not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update schedule",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    Schedule.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown schedule ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "schedule not found",
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

const schedule_categories = async (req, res) => {
  try {
    const categories = await Schedule.distinct("schedule_category", {
      schedule_category: { $nin: [null, ""] },
    });

    // Filter out null/undefined/empty values and sort
    const validCategories = categories
      .filter((cat) => cat && cat.trim() !== "")
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      status: 200,
      message: "success",
      data: validCategories,
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
  add_bulk,
  schedule_list,
  schedule_public_list,
  schedule_home_list,
  schedule_by_product,
  schedule_calendar_list,
  schedule_categories,
  schedule_detail,
  adjust,
  takedown,
};
