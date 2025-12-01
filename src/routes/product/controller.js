/** @format */

const Product = require("./model");

const { upload, destroy } = require("../../lib/cd");

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
      instructor_list: 1,
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
      instructor_list: [],
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

    // Parse instructor_list from FormData
    const instructorListData = [];
    let index = 0;

    while (req.body[`instructor_list[${index}][name]`]) {
      const instructorName = req.body[`instructor_list[${index}][name]`];
      const instructorPhotoJson = req.body[`instructor_list[${index}][photo]`];

      instructorListData.push({
        name: instructorName,
        photoJson: instructorPhotoJson,
        index: index,
      });
      index++;
    }

    // Handle instructor photos upload
    const instructorPhotos =
      req.files && req.files.instructor_photos
        ? Array.isArray(req.files.instructor_photos)
          ? req.files.instructor_photos
          : [req.files.instructor_photos]
        : [];

    const photoIndexes = req.body.instructor_photo_indexes
      ? Array.isArray(req.body.instructor_photo_indexes)
        ? req.body.instructor_photo_indexes
        : [req.body.instructor_photo_indexes]
      : [];

    // Process each instructor
    for (let instructorData of instructorListData) {
      const photoIndex = photoIndexes.indexOf(instructorData.index.toString());

      if (photoIndex !== -1 && instructorPhotos[photoIndex]) {
        // Upload new photo
        const { url_picture, url_public } = await upload(
          instructorPhotos[photoIndex]
        );
        payload.instructor_list.push({
          name: instructorData.name,
          photo: {
            public_id: url_public,
            url: url_picture,
          },
        });
      } else if (instructorData.photoJson) {
        // Keep existing photo
        payload.instructor_list.push({
          name: instructorData.name,
          photo: JSON.parse(instructorData.photoJson),
        });
      } else {
        // No photo
        payload.instructor_list.push({
          name: instructorData.name,
          photo: {
            public_id: "",
            url: "",
          },
        });
      }
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
  } = req.body;

  let payload = {
    product_name,
    product_description,
    product_category,
    benefits,
    skill_level,
    language,
    max_participant,
    duration,
    instructor_list: [],
    updated_at: Date.now(),
  };

  try {
    // Handle banner upload
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["banner"] = {
        public_id: url_public,
        url: url_picture,
      };
    } else if (req.body.banner) {
      payload["banner"] = JSON.parse(req.body.banner);
    }

    // Parse instructor_list from FormData
    const instructorListData = [];
    let index = 0;

    while (req.body[`instructor_list[${index}][name]`]) {
      const instructorName = req.body[`instructor_list[${index}][name]`];
      const instructorPhotoJson = req.body[`instructor_list[${index}][photo]`];

      instructorListData.push({
        name: instructorName,
        photoJson: instructorPhotoJson,
        index: index,
      });
      index++;
    }

    // Handle instructor photos upload
    const instructorPhotos =
      req.files && req.files.instructor_photos
        ? Array.isArray(req.files.instructor_photos)
          ? req.files.instructor_photos
          : [req.files.instructor_photos]
        : [];

    const photoIndexes = req.body.instructor_photo_indexes
      ? Array.isArray(req.body.instructor_photo_indexes)
        ? req.body.instructor_photo_indexes
        : [req.body.instructor_photo_indexes]
      : [];

    // Process each instructor
    for (let instructorData of instructorListData) {
      const photoIndex = photoIndexes.indexOf(instructorData.index.toString());

      if (photoIndex !== -1 && instructorPhotos[photoIndex]) {
        // Upload new photo
        const { url_picture, url_public } = await upload(
          instructorPhotos[photoIndex]
        );
        payload.instructor_list.push({
          name: instructorData.name,
          photo: {
            public_id: url_public,
            url: url_picture,
          },
        });
      } else if (instructorData.photoJson) {
        // Keep existing photo
        payload.instructor_list.push({
          name: instructorData.name,
          photo: JSON.parse(instructorData.photoJson),
        });
      } else {
        // No photo
        payload.instructor_list.push({
          name: instructorData.name,
          photo: {
            public_id: "",
            url: "",
          },
        });
      }
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

module.exports = { add, adjust };
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
