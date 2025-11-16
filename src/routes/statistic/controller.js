/** @format */

const Statistic = require("./model");

const defaultID = "690ac2ccc2a5939216f11672";

const statistic_detail = async (req, res) => {
  try {
    Statistic.findOne({ _id: defaultID })
      .then((statistic) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: statistic,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Statistic Found",
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

const adjust = async (req, res) => {
  const {
    year_experience,
    total_participant,
    total_topic_class,
    total_training_completed,
  } = req.body;

  let payload = {
    year_experience,
    total_participant,
    total_topic_class,
    total_training_completed,
    updated_at: Date.now(),
  };

  try {
    Statistic.updateOne({ _id: defaultID }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update statistic`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "statistic not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update statistic",
    });
  }
};

module.exports = {
  statistic_detail,
  adjust,
};
