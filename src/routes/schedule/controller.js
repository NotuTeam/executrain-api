/** @format */

const Schedule = require("./model");

const { upload, destroy } = require("../../lib/cd");

const { AVAILABILITY, SKILL_LEVELS, LANGUAGES } = require("../../config/enum");

const schedule_list = async (req, res) => {
  try {
    const { search, date } = req.query;

    let filter = {};

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
      banner: 1,
      schedule_start: 1,
      schedule_end: 1,
      location: 1,
      quota: 1,
      duration: 1,
      schedule_description: 1,
    }).sort({ schedule_date: 1 });

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedules,
      filters: {
        search: search || null,
        date: date || null,
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
    const { search } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projection = {
      _id: 1,
      schedule_name: 1,
      schedule_date: 1,
      schedule_close_registration_date: 1,
      status: 1,
      banner: 1,
      schedule_start: 1,
      schedule_end: 1,
      location: 1,
      quota: 1,
      duration: 1,
      schedule_description: 1,
    };

    let filter = {};
    if (search) {
      filter.schedule_name = {
        $regex: search,
        $options: "i",
      };
    }

    const upcomingFilter = { ...filter, schedule_date: { $gte: today } };
    const upcomingSchedules = await Schedule.find(
      upcomingFilter,
      projection,
    ).sort({ schedule_date: 1 });

    const pastFilter = { ...filter, schedule_date: { $lt: today } };
    const pastSchedules = await Schedule.find(pastFilter, projection).sort({
      schedule_date: -1,
    });

    const allSchedules = [...upcomingSchedules, ...pastSchedules];
    const total_schedules = allSchedules.length;
    const total_pages = Math.ceil(total_schedules / limit);
    const paginatedSchedules = allSchedules.slice(skip, skip + limit);

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
        banner: 1,
        schedule_start: 1,
        schedule_end: 1,
        location: 1,
        quota: 1,
        duration: 1,
        schedule_description: 1,
      },
    )
      .sort({ schedule_date: 1 })
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedules,
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
        banner: 1,
        schedule_start: 1,
        schedule_end: 1,
        location: 1,
        quota: 1,
        duration: 1,
        schedule_description: 1,
      },
    ).sort({ schedule_date: 1 });

    res.status(200).json({
      status: 200,
      message: "success",
      data: schedules,
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
    Schedule.findOne({ _id: id })
      .then((schedule) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: schedule,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Schedule Found",
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
    schedule_name,
    schedule_description,
    schedule_date,
    schedule_close_registration_date,
    schedule_start,
    schedule_end,
    location,
    quota,
    duration,
    is_assestment,
    benefits,
    skill_level,
    language,
    status,
    link,
  } = req.body;

  try {
    let payload = {
      schedule_name,
      schedule_description,
      schedule_close_registration_date,
      schedule_date,
      schedule_start,
      schedule_end,
      location,
      quota,
      duration,
      is_assestment,
      benefits,
      skill_level:
        skill_level && skill_level !== "-"
          ? skill_level
          : SKILL_LEVELS.BEGINNER,
      language: language && language !== "-" ? language : LANGUAGES.INDONESIA,
      status: status && status !== "-" ? status : AVAILABILITY.OPEN_SEAT,
      link: link || "",
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

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
  const { data } = req.body;

  const payload = data.map((item) => ({
    schedule_name: item.schedule_name,
    schedule_description: item.schedule_description,
    schedule_close_registration_date: item.schedule_close_registration_date,
    schedule_date: item.schedule_date,
    schedule_start: item.schedule_start,
    schedule_end: item.schedule_end,
    location: item.location,
    quota: item.quota,
    duration: item.duration,
    is_assestment: item.is_assestment,
    benefits: item.benefits,
    skill_level:
      item.skill_level && item.skill_level !== "-"
        ? item.skill_level
        : SKILL_LEVELS.BEGINNER,
    language:
      item.language && item.language !== "-"
        ? item.language
        : LANGUAGES.INDONESIA,
    status:
      item.status && item.status !== "-" ? item.status : AVAILABILITY.OPEN_SEAT,
    link: item.link || "",
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
    schedule_description,
    schedule_date,
    schedule_close_registration_date,
    schedule_start,
    schedule_end,
    location,
    quota,
    duration,
    is_assestment,
    benefits,
    skill_level,
    language,
    status,
    link,
  } = req.body;

  try {
    let payload = {
      schedule_name,
      schedule_description,
      schedule_date,
      schedule_close_registration_date,
      schedule_start,
      schedule_end,
      location,
      quota,
      duration,
      is_assestment,
      benefits,
      skill_level,
      language,
      status,
      link: link || "",
      updated_at: Date.now(),
    };

    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    } else if (req.body.banner && req.body.banner !== "undefined") {
      payload["banner"] = JSON.parse(req.body.banner);
    } else {
      payload["banner"] = {
        public_id: "",
        url: "",
      };
    }

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

module.exports = {
  add,
  add_bulk,
  schedule_list,
  schedule_public_list,
  schedule_home_list,
  schedule_calendar_list,
  schedule_detail,
  adjust,
  takedown,
};
