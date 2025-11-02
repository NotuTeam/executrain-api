/** @format */

const Page = require("./model");

const page_list = async (req, res) => {
  try {
    Page.find({}, { _id: 1, name: 1, path: 1, status: 1 })
      .then((pages) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: pages,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: [],
          message: "No Page Found",
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

const page_detail = async (req, res) => {
  const { id } = req.params;

  try {
    Page.findOne({ _id: id })
      .then((page) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: page,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Page Found",
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

const page_layout = async (req, res) => {
  const { path } = req.params;

  try {
    Page.findOne({ path })
      .then((page) => {
        res.status(200).json({
          status: 200,
          message: "success",
          data: page,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(200).json({
          status: 200,
          data: {},
          message: "No Page Found",
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
  const { name, path, status, template, metadata } = req.body;

  try {
    Page.create({
      name,
      path,
      status,
      template,
      metadata,
    })
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
          message: "failed to create an page",
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
  const { name, path, status, template, metadata } = req.body;

  try {
    Page.updateOne(
      { _id: id },
      { name, path, status, template, metadata, updated_at: Date.now() }
    )
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully update page ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "page not found",
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
    Page.deleteOne({ _id: id })
      .then((_) => {
        res.status(200).json({
          status: 200,
          message: `successfully takedown page ${id}`,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({
          status: 400,
          message: "page not found",
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

// const add = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({
//       status: 500,
//       message: "server error",
//     });
//   }
// };

module.exports = {
  add,
  page_list,
  page_detail,
  page_layout,
  adjust,
  takedown,
};
