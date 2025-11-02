/** @format */

const Promo = require("./model");

const { upload, destroy } = require("../../lib/cd");

const promo_list = async (req, res) => {
  try {
    Promo.find(
      {},
      {
        _id: 1,
        promo_name: 1,
        promo_description: 1,
        percentage: 1,
        end_date: 1,
        is_active: 1,
        banner: 1,
      }
    )
      .then((promos) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: promos,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No promos Found",
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

const promo_active = async (req, res) => {
  const { id } = req.params;

  try {
    Promo.findOne({ is_active: true })
      .then((promo) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: promo,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Promo Found",
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
  const { promo_name, promo_description, percentage, end_date, is_active } =
    req.body;

  try {
    let payload = {
      promo_name,
      promo_description,
      percentage,
      end_date,
      is_active,
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Promo.insertOne(payload)
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
          message: "failed to create an promo",
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
  const { promo_name, promo_description, percentage, end_date, is_active } =
    req.body;

  let payload = {
    promo_name,
    promo_description,
    percentage,
    end_date,
    is_active,
    updated_at: Date.now(),
  };

  try {
    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Promo.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update promo ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "promo not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update page",
    });
  }
};

const activate_promo = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  let payload = {
    is_active,
  };

  try {
    Promo.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update promo ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "promo not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update page",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    Promo.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown promo ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "Promo Not Found",
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
  promo_list,
  promo_active,
  adjust,
  activate_promo,
  takedown,
};
