/** @format */

const Product = require("./model");

const { upload, destroy } = require("../../lib/cd");

const product_list = async (req, res) => {
  try {
    Product.find(
      {},
      {
        _id: 1,
        product_name: 1,
        product_category: 1,
        skill_level: 1,
        duration: 1,
        banner: 1,
      }
    )
      .then((products) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: products,
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

const product_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Product.findOne({ _id: id })
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
          message: "No Product Found",
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
    instructors,
    duration,
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
      instructors,
      duration,
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Product.insertOne(payload)
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
          message: "failed to create an product",
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
    instructors,
    duration,
  } = req.body;

  let payload = {
    product_name,
    product_description,
    product_category,
    benefits,
    skill_level,
    language,
    max_participant,
    instructors,
    duration,
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

    Product.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update product ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "product not found",
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
    Product.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown product ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "Product Not Found",
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
  product_list,
  product_detail,
  adjust,
  takedown,
};
