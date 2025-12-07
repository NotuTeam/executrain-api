/** @format */

const Promo = require("./model");

const { upload, destroy } = require("../../lib/cd");

const promo_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const promo_name = req.query.promo_name;
    const is_active = req.query.is_active;
    const sort_order = req.query.sort_order || "desc";

    const filter = {};

    // Filter by promo name (search)
    if (promo_name) {
      filter.promo_name = { $regex: promo_name, $options: "i" };
    }

    // Filter by active status
    if (is_active !== undefined && is_active !== "") {
      filter.is_active = is_active === "true";
    }

    const sort = {
      created_at: sort_order === "asc" ? 1 : -1,
    };

    const total_promos = await Promo.countDocuments(filter);
    const total_pages = Math.ceil(total_promos / limit);

    const promos = await Promo.find(filter, {
      _id: 1,
      promo_name: 1,
      promo_description: 1,
      percentage: 1,
      end_date: 1,
      is_active: 1,
      banner: 1,
      created_at: 1,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: promos,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_promos: total_promos,
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

const promo_active = async (req, res) => {
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
  const { promo_name, promo_description, percentage, end_date, is_active, link } =
    req.body;

  try {
    let payload = {
      promo_name,
      promo_description,
      percentage,
      end_date,
      is_active,
      link: link || "",
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
  const { promo_name, promo_description, percentage, end_date, is_active, link } =
    req.body;

  let payload = {
    promo_name,
    promo_description,
    percentage,
    end_date,
    is_active,
    link: link || "",
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
