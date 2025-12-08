/** @format */

const Page = require("./model");
const { upload, destroy } = require("../../lib/cd");
const { STATUS } = require("../../config/enum");

const page_list = async (req, res) => {
  try {
    const { page = 1, search = "", status, sort_order = "desc" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = 12; // Fixed limit
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { path: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Page.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Sort order
    const sortOrder = sort_order === "asc" ? 1 : -1;

    // Get paginated results
    const pages = await Page.find(query, {
      _id: 1,
      name: 1,
      path: 1,
      type: 1,
      status: 1,
      created_at: 1,
      updated_at: 1,
    })
      .sort({ updated_at: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      status: 200,
      message: "success",
      data: pages,
      pagination: {
        total,
        current_page: pageNum,
        total_pages: totalPages,
        per_page: limitNum,
        has_next: hasNext,
        has_prev: hasPrev,
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

const page_published = async (req, res) => {
  try {
    const pages = await Page.find(
      { status: "PUBLISHED" },
      {
        _id: 1,
        name: 1,
        path: 1,
        type: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );

    res.status(200).json({
      status: 200,
      message: "success",
      data: pages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const page_detail = async (req, res) => {
  const { id } = req.params;

  try {
    const page = await Page.findOne({ _id: id });

    if (!page) {
      return res.status(404).json({
        status: 404,
        message: "Page not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: page,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const page_layout = async (req, res) => {
  const { path } = req.params;

  console.log(path);

  try {
    const page = await Page.findOne({ path, status: "PUBLISHED" });

    if (!page) {
      return res.status(404).json({
        status: 404,
        message: "Page not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: page,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const add = async (req, res) => {
  const { name, path, type, status, template, metadata } = req.body;

  try {
    // Check if path already exists
    const existingPage = await Page.findOne({ path });
    if (existingPage) {
      return res.status(400).json({
        status: 400,
        message: "Page with this path already exists",
      });
    }

    // Parse template if it's a string
    const parsedTemplate =
      typeof template === "string" ? JSON.parse(template) : template;
    const parsedMetadata =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;

    // Handle image uploads in template
    const processedTemplate = await Promise.all(
      (parsedTemplate || []).map(async (component) => {
        const processedComponent = { ...component };

        // Upload background image if marked for upload
        if (
          component.props?.backgroundImage === "__UPLOAD__" &&
          req.files?.[`bg_${component.id}`]
        ) {
          const file = req.files[`bg_${component.id}`];
          const { url_picture, url_public } = await upload(file);
          processedComponent.props = processedComponent.props || {};
          processedComponent.props.backgroundImage = {
            url: url_picture,
            public_id: url_public,
          };
        } else if (component.props?.backgroundImage === "__UPLOAD__") {
          // If marked for upload but no file, set to null
          processedComponent.props.backgroundImage = null;
        }

        // Upload component image (for image components)
        if (
          component.type === "image" &&
          component.props?.src === "__UPLOAD__" &&
          req.files?.[`img_${component.id}`]
        ) {
          const file = req.files[`img_${component.id}`];
          const { url_picture, url_public } = await upload(file);
          processedComponent.props = processedComponent.props || {};
          processedComponent.props.src = url_picture;
          processedComponent.props.imagePublicId = url_public;
        } else if (
          component.type === "image" &&
          component.props?.src === "__UPLOAD__"
        ) {
          // If marked for upload but no file, keep default or set placeholder
          processedComponent.props.src = component.props.src;
        }

        return processedComponent;
      })
    );

    // Handle OG image upload
    if (parsedMetadata?.ogImage === "__UPLOAD__" && req.files?.ogImage) {
      const { url_picture, url_public } = await upload(req.files.ogImage);
      parsedMetadata.ogImage = url_picture;
      parsedMetadata.ogImagePublicId = url_public;
    } else if (parsedMetadata?.ogImage === "__UPLOAD__") {
      parsedMetadata.ogImage = "";
    }

    const page = await Page.create({
      name,
      path,
      type: type || "Other",
      status: status || STATUS.DRAFT,
      template: processedTemplate,
      metadata: parsedMetadata,
    });

    res.status(201).json({
      status: 201,
      message: "Page created successfully",
      data: page,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: error.message || "server error",
    });
  }
};

const adjust = async (req, res) => {
  const { id } = req.params;
  const { name, path, type, status, template, metadata } = req.body;

  try {
    // Get existing page
    const existingPage = await Page.findById(id);
    if (!existingPage) {
      return res.status(404).json({
        status: 404,
        message: "page not found",
      });
    }

    // Check if path is being changed and if it conflicts
    if (path !== existingPage.path) {
      const pathExists = await Page.findOne({ path, _id: { $ne: id } });
      if (pathExists) {
        return res.status(400).json({
          status: 400,
          message: "Page with this path already exists",
        });
      }
    }

    // Parse template if it's a string
    const parsedTemplate =
      typeof template === "string" ? JSON.parse(template) : template;
    const parsedMetadata =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;

    // Handle image uploads in template
    const processedTemplate = await Promise.all(
      (parsedTemplate || []).map(async (component) => {
        const processedComponent = { ...component };

        // Find existing component to check for old images
        const existingComponent = existingPage.template?.find(
          (c) => c.id === component.id
        );

        // Handle background image
        if (
          component.props?.backgroundImage === "__UPLOAD__" &&
          req.files?.[`bg_${component.id}`]
        ) {
          // Delete old background image if exists
          if (existingComponent?.props?.backgroundImage?.public_id) {
            await destroy(existingComponent.props.backgroundImage.public_id);
          }

          const file = req.files[`bg_${component.id}`];
          const { url_picture, url_public } = await upload(file);
          processedComponent.props = processedComponent.props || {};
          processedComponent.props.backgroundImage = {
            url: url_picture,
            public_id: url_public,
          };
        } else if (component.props?.backgroundImage === "__UPLOAD__") {
          // If marked for upload but no file, keep existing or set null
          processedComponent.props.backgroundImage =
            existingComponent?.props?.backgroundImage || null;
        } else if (component.props?.backgroundImage?.url) {
          // Keep existing server image reference
          processedComponent.props.backgroundImage =
            component.props.backgroundImage;
        } else if (component.props?.backgroundImage) {
          // Keep URL or null value
          processedComponent.props.backgroundImage =
            component.props.backgroundImage;
        } else if (existingComponent?.props?.backgroundImage) {
          // Preserve existing background if not changed
          processedComponent.props = processedComponent.props || {};
          processedComponent.props.backgroundImage =
            existingComponent.props.backgroundImage;
        }

        // Handle image component
        if (
          component.type === "image" &&
          component.props?.src === "__UPLOAD__" &&
          req.files?.[`img_${component.id}`]
        ) {
          // Delete old image if exists
          if (existingComponent?.props?.imagePublicId) {
            await destroy(existingComponent.props.imagePublicId);
          }

          const file = req.files[`img_${component.id}`];
          const { url_picture, url_public } = await upload(file);
          processedComponent.props = processedComponent.props || {};
          processedComponent.props.src = url_picture;
          processedComponent.props.imagePublicId = url_public;
        } else if (
          component.type === "image" &&
          component.props?.src === "__UPLOAD__"
        ) {
          // Keep existing image
          processedComponent.props.src =
            existingComponent?.props?.src || component.props.src;
          processedComponent.props.imagePublicId =
            existingComponent?.props?.imagePublicId;
        }

        return processedComponent;
      })
    );

    // Handle OG image upload
    if (parsedMetadata?.ogImage === "__UPLOAD__" && req.files?.ogImage) {
      // Delete old OG image if exists
      if (existingPage.metadata?.ogImagePublicId) {
        await destroy(existingPage.metadata.ogImagePublicId);
      }

      const { url_picture, url_public } = await upload(req.files.ogImage);
      parsedMetadata.ogImage = url_picture;
      parsedMetadata.ogImagePublicId = url_public;
    } else if (parsedMetadata?.ogImage === "__UPLOAD__") {
      // Keep existing OG image
      parsedMetadata.ogImage = existingPage.metadata?.ogImage || "";
      parsedMetadata.ogImagePublicId =
        existingPage.metadata?.ogImagePublicId || "";
    }

    // Delete images from removed components
    if (existingPage.template) {
      const removedComponents = existingPage.template.filter(
        (existing) =>
          !parsedTemplate.some((updated) => updated.id === existing.id)
      );

      for (const component of removedComponents) {
        if (component.props?.backgroundImage?.public_id) {
          await destroy(component.props.backgroundImage.public_id);
        }
        if (component.props?.imagePublicId) {
          await destroy(component.props.imagePublicId);
        }
      }
    }

    await Page.updateOne(
      { _id: id },
      {
        name,
        path,
        type: type || "Other",
        status,
        template: processedTemplate,
        metadata: parsedMetadata,
        updated_at: Date.now(),
      }
    );

    res.status(200).json({
      status: 200,
      message: `Page updated successfully`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err.message || "server error",
    });
  }
};

const change_status = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the page
    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        status: 404,
        message: "Page not found",
      });
    }

    // Toggle status
    const newStatus = page.status === STATUS.PUBLISHED ? STATUS.DRAFT : STATUS.PUBLISHED;

    // Update status
    await Page.updateOne(
      { _id: id },
      {
        status: newStatus,
        updated_at: Date.now(),
      }
    );

    res.status(200).json({
      status: 200,
      message: `Page status changed to ${newStatus} successfully`,
      data: {
        previous_status: page.status,
        current_status: newStatus,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: error.message || "server error",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;

  try {
    // Get page to delete associated images
    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        status: 404,
        message: "page not found",
      });
    }

    // Delete all images associated with the page
    if (page.template) {
      for (const component of page.template) {
        if (component.props?.backgroundImage?.public_id) {
          await destroy(component.props.backgroundImage.public_id);
        }
        if (component.props?.imagePublicId) {
          await destroy(component.props.imagePublicId);
        }
      }
    }

    // Delete OG image if exists
    if (page.metadata?.ogImagePublicId) {
      await destroy(page.metadata.ogImagePublicId);
    }

    // Delete the page
    await Page.deleteOne({ _id: id });

    res.status(200).json({
      status: 200,
      message: `Page deleted successfully`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: error.message || "server error",
    });
  }
};

module.exports = {
  page_list,
  page_published,
  page_detail,
  page_layout,
  add,
  adjust,
  change_status,
  takedown,
};
