/** @format */

const Testimonial = require("./model");

const { upload, destroy } = require("../../lib/cd");

const testimonial_list = async (req, res) => {
  try {
    Testimonial.find(
      {},
      {
        _id: 1,
        person_name: 1,
        person_title: 1,
        testimonial: 1,
        photo: 1,
      },
    )
      .then((testimonials) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: testimonials,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Testimonials Found",
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

const testimonial_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Testimonial.findOne({ _id: id })
      .then((testimonial) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: testimonial,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Testimonial Found",
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
  const { person_name, person_title, testimonial } = req.body;

  try {
    let payload = {
      person_name,
      person_title,
      testimonial,
    };

    if (req.files) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["photo"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    Testimonial.insertOne(payload)
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
          message: "failed to create an testimonial",
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
  const { person_name, person_title, testimonial } = req.body;

  let payload = {
    person_name,
    person_title,
    testimonial,
    updated_at: Date.now(),
  };

  try {
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["photo"] = {
        public_id: url_public,
        url: url_picture,
      };
    } else if (req.body.photo && req.body.photo !== "undefined") {
      payload["photo"] = JSON.parse(req.body.photo);
    } else {
      payload["photo"] = {
        public_id: "",
        url: "",
      };
    }

    Testimonial.updateOne({ _id: id }, payload)
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update testimonial ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "testimonial not found",
        });
      });
  } catch (err) {
    return res.status(404).json({
      status: 404,
      message: "failed to update testimonial",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    Testimonial.deleteOne({ _id: id })
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown testimonial ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "Testimonial Not Found",
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
  testimonial_list,
  testimonial_detail,
  adjust,
  takedown,
};
