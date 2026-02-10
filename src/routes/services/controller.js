/** @format */

const Service = require("./model");

const { upload, destroy } = require("../../lib/cd");

const service_list = async (req, res) => {
  try {
    Service.find(
      {},
      {
        _id: 1,
        service_name: 1,
        service_description: 1,
        slug: 1,
        logo: 1,
      },
    )
      .then((services) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: services,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Services Found",
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

const service_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Service.findOne({ _id: id })
      .then((service) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: service,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Service Found",
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
  const { service_name, service_description } = req.body;

  try {
    let payload = {
      service_name,
      service_description,
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["logo"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Service.insertOne(payload)
      .then((service) => {
        res.status(201).json({
          status: 201,
          message: "success",
          data: service,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "failed to create a service",
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
  const { service_name, service_description } = req.body;

  let payload = {
    service_name,
    service_description,
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

    Service.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update service ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "service not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update service",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    Service.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown service ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "Service Not Found",
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
  service_list,
  service_detail,
  adjust,
  takedown,
};
