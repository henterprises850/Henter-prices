const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (subCategory && subCategory !== "All") {
      filter.subCategory = subCategory;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getBestsellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ bestseller: true }).limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      user: req.user.id,
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Bulk create products
const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products array is required and cannot be empty",
      });
    }

    // Validate each product
    const validatedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Basic validation
      if (!product.name || !product.price || !product.category) {
        errors.push(
          `Product ${i + 1}: Missing required fields (name, price, category)`
        );
        continue;
      }

      if (product.price <= 0) {
        errors.push(`Product ${i + 1}: Price must be greater than 0`);
        continue;
      }

      // Check if product with same name already exists
      const existingProduct = await Product.findOne({ name: product.name });
      if (existingProduct) {
        errors.push(
          `Product ${i + 1}: Product with name "${product.name}" already exists`
        );
        continue;
      }

      // Format the product data
      const formattedProduct = {
        name: product.name.trim(),
        description: product.description?.trim() || "",
        price: parseFloat(product.price),
        originalPrice: product.originalPrice
          ? parseFloat(product.originalPrice)
          : null,
        category: product.category.trim(),
        subCategory: product.subCategory?.trim() || "",
        sizes: Array.isArray(product.sizes)
          ? product.sizes
          : product.sizes?.split(",").map((s) => s.trim()) || [],
        colors: Array.isArray(product.colors)
          ? product.colors
          : product.colors?.split(",").map((c) => c.trim()) || [],
        images: Array.isArray(product.images)
          ? product.images
          : product.images?.split(",").map((img) => img.trim()) || [],
        stock: parseInt(product.stock) || 0,
        rating: parseFloat(product.rating) || 0,
        numReviews: parseInt(product.numReviews) || 0,
        bestseller: Boolean(product.bestseller),
        featured: Boolean(product.featured),
      };

      validatedProducts.push(formattedProduct);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors found",
        errors: errors,
      });
    }

    // Insert all products
    const createdProducts = await Product.insertMany(validatedProducts);

    console.log(`Bulk created ${createdProducts.length} products`);
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdProducts.length} products`,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Bulk create products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during bulk product creation",
      error: error.message,
    });
  }
};

// Get product statistics for admin dashboard
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Product.distinct("category").then(
      (categories) => categories.length
    );
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const featuredProducts = await Product.countDocuments({ featured: true });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        outOfStock,
        featuredProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getBestsellerProducts,
  getLatestProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  getProductStats,
};
