const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/dataUri");

// Create Product -- Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const file = req.file;
  if (!file) {
    return next(new ErrorHandler("Thumbnail is Required.", 400));
  }

  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  const product = await Product.create({
    ...req.body,
    image: {
      public_id: myCloud.public_id,
      url: myCloud.url,
    },
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// Update Product -- Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  const file = req.file;

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (file) {
    await cloudinary.v2.uploader.destroy(product.image.public_id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    product.image.public_id = myCloud.public_id;
    product.image.url = myCloud.url;
  }

  await product.save();

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, product });
});

// Delete Product -- Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  await cloudinary.v2.uploader.destroy(product.image.public_id);

  await product.remove();
  res
    .status(200)
    .json({ success: true, message: "Product Deleted Successfully" });
});

// Get Product Details -- Admin
exports.getProductDetails = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  res.status(200).json({ success: true, product });
});

// Get all Products -- Public
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const resultPerPage = 40;
  const productCount = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({ success: true, products, productCount });
});

// Create New Review or Update the review
exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get all reviews of Product
exports.getProductReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) return next(new ErrorHandler("Product Not found", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
