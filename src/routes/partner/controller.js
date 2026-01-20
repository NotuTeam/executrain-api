/** @format */

const Partner = require("./model");

const { upload, destroy } = require("../../lib/cd");

const partner_list = async (req, res) => {
  try {
    Partner.find(
      {},
      {
        _id: 1,
        partner_name: 1,
        logo: 1,
      },
    )
      .then((partners) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: partners,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Products Found",
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

const partner_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Partner.findOne({ _id: id })
      .then((partner) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: partner,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Partner Found",
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
  const { partner_name } = req.body;

  try {
    let payload = {
      partner_name,
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["logo"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Partner.insertOne(payload)
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
          message: "failed to create an partner",
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
  const { partner_name } = req.body;

  let payload = {
    partner_name,
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

    Partner.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update partner ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "partner not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update partner",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    Partner.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown partner ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "Partner Not Found",
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
  partner_list,
  partner_detail,
  adjust,
  takedown,
};
