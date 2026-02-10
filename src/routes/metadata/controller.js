/** @format */

const Metadata = require("./model");
const { STATUS } = require("../../config/enum");

// GET - List all metadata (admin)
const metadata_list = async (req, res) => {
  try {
    const metadata = await Metadata.find().sort({ created_at: -1 });

    res.status(200).json({
      status: true,
      message: "Metadata fetched successfully",
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// GET - Get metadata by page name (public)
const metadata_by_page = async (req, res) => {
  try {
    const { page } = req.params;

    // Validate page name
    const validPages = ["home", "about", "contact", "product", "schedule", "service"];
    if (!validPages.includes(page)) {
      return res.status(400).json({
        status: false,
        message: "Invalid page name",
      });
    }

    const metadata = await Metadata.findOne({
      page: page,
      status: STATUS.PUBLISHED,
    });

    if (!metadata) {
      return res.status(404).json({
        status: false,
        message: "Metadata not found for this page",
      });
    }

    res.status(200).json({
      status: true,
      message: "Metadata fetched successfully",
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// GET - Get metadata by page (admin with draft)
const metadata_detail = async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await Metadata.findById(id);

    if (!metadata) {
      return res.status(404).json({
        status: false,
        message: "Metadata not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Metadata fetched successfully",
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// POST - Add new metadata
const add = async (req, res) => {
  try {
    const {
      page,
      title,
      description,
      keywords,
      canonical_url,
      og_title,
      og_description,
      og_image,
      og_type,
      twitter_card,
      twitter_title,
      twitter_description,
      twitter_image,
      author,
      language,
      viewport,
      robots,
      json_ld,
    } = req.body;

    // Validate required fields
    if (!page || !title || !description) {
      return res.status(400).json({
        status: false,
        message: "page, title, and description are required",
      });
    }

    // Check if metadata for this page already exists
    const existingMetadata = await Metadata.findOne({ page });
    if (existingMetadata) {
      return res.status(400).json({
        status: false,
        message: `Metadata for page '${page}' already exists`,
      });
    }

    const newMetadata = new Metadata({
      page,
      title,
      description,
      keywords,
      canonical_url,
      og_title: og_title || title,
      og_description: og_description || description,
      og_image,
      og_type: og_type || "website",
      twitter_card: twitter_card || "summary_large_image",
      twitter_title: twitter_title || title,
      twitter_description: twitter_description || description,
      twitter_image,
      author,
      language: language || "id",
      viewport: viewport || "width=device-width, initial-scale=1.0",
      robots: robots || { index: true, follow: true },
      json_ld,
    });

    await newMetadata.save();

    res.status(201).json({
      status: true,
      message: "Metadata created successfully",
      data: newMetadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// PUT - Update metadata
const adjust = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Add updated_at timestamp
    updates.updated_at = new Date();

    const metadata = await Metadata.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!metadata) {
      return res.status(404).json({
        status: false,
        message: "Metadata not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Metadata updated successfully",
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// PUT - Change metadata status (draft/published)
const change_status = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(STATUS).includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status",
      });
    }

    const metadata = await Metadata.findByIdAndUpdate(
      id,
      {
        status,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!metadata) {
      return res.status(404).json({
        status: false,
        message: "Metadata not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Metadata status updated successfully",
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// DELETE - Delete metadata
const takedown = async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = await Metadata.findByIdAndDelete(id);

    if (!metadata) {
      return res.status(404).json({
        status: false,
        message: "Metadata not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Metadata deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  metadata_list,
  metadata_by_page,
  metadata_detail,
  add,
  adjust,
  change_status,
  takedown,
};
