/** @format */

const Product = require("./model");

const { upload, destroy } = require("../../lib/cd");
const {
  deleteImageFromCDN,
  updateImageWithCleanup,
  cleanupImagesOnDelete,
} = require("../../lib/imageManager");

const product_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const product_category = req.query.product_category;
    const sort_order = req.query.sort_order || "desc";
    const product_name = req.query.product_name;

    const filter = {};

    if (product_category) {
      filter.product_category = product_category;
    }

    if (product_name) {
      filter.product_name = { $regex: product_name, $options: "i" };
    }

    const sort = {
      created_at: sort_order === "asc" ? 1 : -1,
    };

    const total_products = await Product.countDocuments(filter);
    const total_pages = Math.ceil(total_products / limit);

    const products = await Product.find(filter, {
      _id: 1,
      product_name: 1,
      product_category: 1,
      skill_level: 1,
      max_participant: 1,
      duration: 1,
      product_description: 1,
      banner: 1,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: products,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_products: total_products,
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
    duration,
    link,
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
      duration,
      link: link || "",
    };

    // Handle banner upload
    if (req.files && req.files.file) {
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
    duration,
    link,
  } = req.body;

  try {
    // Get existing product
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    let payload = {
      product_name,
      product_description,
      product_category,
      benefits,
      skill_level,
      language,
      max_participant,
      duration,
      link: link || "",
      updated_at: Date.now(),
    };

    // Handle banner upload with cleanup
    if (req.files && req.files.file) {
      // Update image dengan menghapus gambar lama
      payload.banner = await updateImageWithCleanup(
        existingProduct,
        "banner",
        req.files.file,
        "product"
      );
    } else if (req.body.banner && req.body.banner !== "undefined") {
      // Gunakan banner yang ada (tidak ada perubahan)
      payload.banner = JSON.parse(req.body.banner);
    } else {
      // Hapus banner
      if (existingProduct.banner && existingProduct.banner.public_id) {
        await deleteImageFromCDN(existingProduct.banner.public_id, "product");
      }
      payload.banner = {
        public_id: "",
        url: "",
      };
    }

    await Product.updateOne({ _id: id }, payload);

    res.status(200).json({
      status: 200,
      message: `successfully update product ${id}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

module.exports = { add, adjust };
const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    // Get existing product before delete
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    // Cleanup images from CDN
    await cleanupImagesOnDelete(existingProduct, ["banner"], "product");

    // Delete all schedules related to this product
    const Schedule = require("../schedule/model");
    const deletedSchedules = await Schedule.deleteMany({ product_id: id });
    console.log(`Deleted ${deletedSchedules.deletedCount} schedules related to product ${id}`);

    // Delete from database
    await Product.deleteOne({ _id: id });

    res.status(200).json({
      status: 200,
      message: `successfully takedown product ${id} and ${deletedSchedules.deletedCount} related schedules`,
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
