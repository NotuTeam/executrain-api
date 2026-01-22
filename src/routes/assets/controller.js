/** @format */

const Asset = require("./model");
const { upload, destroy } = require("../../lib/cd");

const ASSET_CATEGORIES = [
  {
    category: "hero_background",
    name: "Hero Background",
    default_url: "https://res.cloudinary.com/dgd3iusxa/image/upload/v1764557996/hero_ygtlgs.webp",
    type: "image",
  },
  {
    category: "hero_video",
    name: "Hero Video",
    default_url: "https://res.cloudinary.com/dgd3iusxa/video/upload/v1764557991/hero-vid_d2rydq.mp4",
    type: "video",
  },
  {
    category: "about_image",
    name: "About Section Image",
    default_url: "/about.png",
    type: "image",
  },
  {
    category: "statistic_background",
    name: "Statistic Background",
    default_url: "/hero4.webp",
    type: "image",
  },
  {
    category: "steps_background",
    name: "Steps Background",
    default_url: "/hero4.webp",
    type: "image",
  },
  {
    category: "services_image",
    name: "Services Section Image",
    default_url: "/hero2.webp",
    type: "image",
  },
  {
    category: "cta_schedule_image",
    name: "CTA Schedule Image",
    default_url: "https://res.cloudinary.com/dgd3iusxa/image/upload/v1763043354/pup0wtnjecrh92iyk3it.webp",
    type: "image",
  },
  {
    category: "contact_image",
    name: "Contact Section Image",
    default_url: "/contact-us.png",
    type: "image",
  },
];

const asset_list = async (req, res) => {
  try {
    let assets = await Asset.find({}).sort({ category: 1 });

    if (assets.length === 0) {
      const defaultAssets = ASSET_CATEGORIES.map((cat) => ({
        category: cat.category,
        name: cat.name,
        url: cat.default_url,
        fallback_url: cat.default_url,
        type: cat.type,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      assets = await Asset.insertMany(defaultAssets);
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: assets,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const asset_detail = async (req, res) => {
  const { category } = req.params;

  try {
    let asset = await Asset.findOne({ category });

    if (!asset) {
      const defaultCat = ASSET_CATEGORIES.find((c) => c.category === category);
      if (defaultCat) {
        asset = await Asset.create({
          category: defaultCat.category,
          name: defaultCat.name,
          url: defaultCat.default_url,
          fallback_url: defaultCat.default_url,
          type: defaultCat.type,
          is_active: true,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Asset category not found",
        });
      }
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: asset,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const asset_all = async (req, res) => {
  try {
    let assets = await Asset.find({ is_active: true });

    if (assets.length === 0) {
      const defaultAssets = ASSET_CATEGORIES.map((cat) => ({
        category: cat.category,
        name: cat.name,
        url: cat.default_url,
        fallback_url: cat.default_url,
        type: cat.type,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      assets = await Asset.insertMany(defaultAssets);
    }

    const assetMap = {};
    assets.forEach((asset) => {
      assetMap[asset.category] = {
        url: asset.url,
        fallback_url: asset.fallback_url || asset.url,
        type: asset.type,
      };
    });

    res.status(200).json({
      status: 200,
      message: "success",
      data: assetMap,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const adjust = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        status: 404,
        message: "Asset not found",
      });
    }

    const payload = {
      updated_at: Date.now(),
    };

    // Handle file upload
    if (req.files && req.files.file) {
      const { file } = req.files;
      
      // Delete old asset from cloudinary if exists and is a cloudinary URL
      if (asset.public_id) {
        try {
          await destroy(asset.public_id);
        } catch (e) {
          console.log("Failed to delete old asset:", e.message);
        }
      }

      const { url_picture, url_public } = await upload(file);
      payload.url = url_picture;
      payload.public_id = url_public;
      
      // Set fallback to old URL or keep current fallback
      if (!asset.fallback_url || asset.fallback_url === asset.url) {
        payload.fallback_url = asset.url;
      }
    }

    // Handle fallback file upload
    if (req.files && req.files.fallback_file) {
      const { fallback_file } = req.files;
      
      if (asset.fallback_public_id) {
        try {
          await destroy(asset.fallback_public_id);
        } catch (e) {
          console.log("Failed to delete old fallback:", e.message);
        }
      }

      const { url_picture, url_public } = await upload(fallback_file);
      payload.fallback_url = url_picture;
      payload.fallback_public_id = url_public;
    }

    if (is_active !== undefined) payload.is_active = is_active === "true" || is_active === true;

    await Asset.updateOne({ _id: id }, payload);

    const updatedAsset = await Asset.findById(id);

    res.status(200).json({
      status: 200,
      message: "Successfully updated asset",
      data: updatedAsset,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to update asset",
    });
  }
};

// Update asset dengan URL langsung (direct upload dari client ke Cloudinary)
const adjust_url = async (req, res) => {
  const { id } = req.params;
  const { url, fallback_url } = req.body;

  try {
    const asset = await Asset.findById(id);

    if (!asset) {
      return res.status(404).json({
        status: 404,
        message: "Asset not found",
      });
    }

    const payload = {
      updated_at: Date.now(),
    };

    if (url) {
      payload.url = url;
    }

    if (fallback_url) {
      payload.fallback_url = fallback_url;
    }

    await Asset.updateOne({ _id: id }, payload);

    const updatedAsset = await Asset.findById(id);

    res.status(200).json({
      status: 200,
      message: "Successfully updated asset",
      data: updatedAsset,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "Failed to update asset",
    });
  }
};

module.exports = {
  asset_list,
  asset_detail,
  asset_all,
  adjust,
  adjust_url,
};
