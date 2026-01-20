/** @format */

const Socmed = require("./model");

const { upload, destroy } = require("../../lib/cd");

const socmed_list = async (req, res) => {
  try {
    Socmed.find(
      {},
      {
        _id: 1,
        socmed_name: 1,
        socmed_link: 1,
        logo: 1,
      },
    )
      .then((socmeds) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: socmeds,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Social Media Found",
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

const socmed_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Socmed.findOne({ _id: id })
      .then((socmed) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: socmed,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Social Media Found",
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
  const { id } = req.params;
  const { socmed_name, socmed_link } = req.body;

  let payload = {
    socmed_name,
    socmed_link,
    updated_at: Date.now(),
  };

  try {
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["logo"] = {
        public_id: url_public,
        url: url_picture,
      };
    } else if (req.body.logo && req.body.logo !== "undefined") {
      payload["logo"] = JSON.parse(req.body.logo);
    } else {
      payload["logo"] = {
        public_id: "",
        url: "",
      };
    }

    Socmed.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update social media ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "social media not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update social media",
    });
  }
};

module.exports = {
  socmed_list,
  socmed_detail,
  adjust,
};
