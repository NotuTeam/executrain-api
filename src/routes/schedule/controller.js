/** @format */

const Schedule = require("./model");

const { upload, destroy } = require("../../lib/cd");

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
      lecturer: 1,
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
    lecturer,
    is_assestment,
    benefits,
    skill_level,
    language,
    status,
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
      lecturer,
      is_assestment,
      benefits,
      skill_level,
      language,
      status,
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

  try {
    Schedule.insertMany(data)
      .then(() => {
        res.status(201).json({
          status: 201,
          message: "success",
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
    lecturer,
    is_assestment,
    benefits,
    skill_level,
    language,
    status,
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
      lecturer,
      is_assestment,
      benefits,
      skill_level,
      language,
      status,
      updated_at: Date.now(),
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
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
  schedule_detail,
  adjust,
  takedown,
};
