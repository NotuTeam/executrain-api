/** @format */

const Schedule = require("./model");

const schedule_list = async (req, res) => {
  try {
    Schedule.find({}, { _id: 1, title: 1, date: 1, priority: 1 })
      .then((users) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: users,
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
  const { title, description, date, time, duration, location, quota, type } =
    req.body;

  try {
    Schedule.create({
      title,
      description,
      date,
      time,
      duration,
      location,
      quota,
      type,
    })
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
    Schedule.create(data)
      .then((schedules) => {
        res.status(201).json({
          status: 201,
          message: "success",
          data: schedules,
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
  const { title, description, date, time, duration, location, quota, type } =
    req.body;

  try {
    Schedule.updateOne(
      { _id: id },
      {
        title,
        description,
        date,
        time,
        duration,
        location,
        quota,
        type,
        updated_at: Date.now(),
      }
    )
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
      .then((_) => {
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

// const add = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({
//       status: 500,
//       message: "server error",
//     });
//   }
// };

module.exports = {
  add,
  add_bulk,
  schedule_list,
  schedule_detail,
  adjust,
  takedown,
};
