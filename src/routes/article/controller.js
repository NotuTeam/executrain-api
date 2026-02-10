/** @format */

const Article = require("./model");

const { upload, destroy } = require("../../lib/cd");
const { processArticleContentImages, deleteArticleContentImages } = require("./imageHandler");

const article_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = req.query.category;
    const status = req.query.status;
    const sort_order = req.query.sort_order || "desc";
    const search = req.query.search;
    const tag = req.query.tag;

    const filter = {};

    // For public endpoints, only show published articles
    if (req.path.includes("/public/")) {
      filter.status = "PUBLISHED";
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    const sort = {
      created_at: sort_order === "asc" ? 1 : -1,
    };

    const total_articles = await Article.countDocuments(filter);
    const total_pages = Math.ceil(total_articles / limit);

    const articles = await Article.find(filter, {
      _id: 1,
      title: 1,
      slug: 1,
      excerpt: 1,
      author: 1,
      tags: 1,
      featured_image: 1,
      status: 1,
      views: 1,
      published_at: 1,
      created_at: 1,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "success",
      data: articles,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_articles: total_articles,
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

const article_detail = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findOneAndUpdate(
      { _id: id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        status: 404,
        message: "Article not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: article,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const article_by_slug = async (req, res) => {
  const { slug } = req.params;

  try {
    const article = await Article.findOneAndUpdate(
      { slug: slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        status: 404,
        message: "Article not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "success",
      data: article,
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
  const {
    title,
    content,
    excerpt,
    author,
    tags,
    status,
    meta_title,
    meta_description,
    meta_keywords,
  } = req.body;

  try {
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let payload = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 150) + "...",
      author: author || "Admin",
      tags: tags || [],
      status,
      meta_title,
      meta_description,
      meta_keywords: meta_keywords || [],
    };

    // Process content images - upload base64 images to CDN
    if (content) {
      try {
        const { processedContent, uploadedImages } =
          await processArticleContentImages(content);
        payload.content = processedContent;
        console.log(
          `Uploaded ${uploadedImages.length} images from article content`
        );
      } catch (error) {
        console.error("Error processing content images:", error);
        // If image processing fails, save original content
        payload.content = content;
      }
    }

    // Set published_at if status is PUBLISHED
    if (status === "PUBLISHED") {
      payload.published_at = new Date();
    }

    // Handle featured image upload
    if (req.files && req.files.file) {
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload.featured_image = {
        public_id: url_public,
        url: url_picture,
      };
    }

    const article = await Article.create(payload);

    res.status(201).json({
      status: 201,
      message: "success",
      data: article,
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
    title,
    content,
    excerpt,
    author,
    tags,
    status,
    meta_title,
    meta_description,
    meta_keywords,
  } = req.body;

  try {
    // Get existing article to delete old images if content changes
    const existingArticle = await Article.findById(id);

    if (!existingArticle) {
      return res.status(404).json({
        status: 404,
        message: "Article not found",
      });
    }

    let payload = {
      excerpt,
      author,
      tags,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      updated_at: Date.now(),
    };

    // Generate slug from title if changed
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      payload.title = title;
      payload.slug = slug;
    }

    // Process content images - upload base64 images to CDN
    if (content) {
      try {
        // Delete old images from existing content that are NOT in new content
        await deleteArticleContentImages(existingArticle.content, content);

        // Upload new images
        const { processedContent, uploadedImages } =
          await processArticleContentImages(content);
        payload.content = processedContent;
        console.log(
          `Uploaded ${uploadedImages.length} images from updated article content`
        );
      } catch (error) {
        console.error("Error processing content images:", error);
        // If image processing fails, save original content
        payload.content = content;
      }
    }

    // Set or unset published_at based on status
    if (status === "PUBLISHED" && !existingArticle.published_at) {
      payload.published_at = new Date();
    }

    // Handle featured image upload
    if (req.files && req.files.file) {
      // Delete old featured image if exists
      if (existingArticle.featured_image?.public_id) {
        await destroy(existingArticle.featured_image.public_id);
      }

      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload.featured_image = {
        public_id: url_public,
        url: url_picture,
      };
    } else if (req.body.featured_image && req.body.featured_image !== "undefined") {
      payload.featured_image = JSON.parse(req.body.featured_image);
    }

    const article = await Article.findByIdAndUpdate(id, payload, { new: true });

    if (!article) {
      return res.status(404).json({
        status: 404,
        message: "Article not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: `successfully update article ${id}`,
      data: article,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "server error",
    });
  }
};

const takedown = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        status: 404,
        message: "Article not found",
      });
    }

    // Delete featured image if exists
    if (article.featured_image && article.featured_image.public_id) {
      await destroy(article.featured_image.public_id);
    }

    // Delete images from content
    await deleteArticleContentImages(article.content);

    res.status(200).json({
      status: 200,
      message: `successfully takedown article ${id}`,
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
  article_list,
  article_detail,
  article_by_slug,
  adjust,
  takedown,
};
