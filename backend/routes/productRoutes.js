const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReview,
  deleteReview,
} = require("../controllers/productControllers");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");
const singleUpload = require("../middlewares/multer");

const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/admin/product/new")
  .post(isAuthenticated, isAdmin("admin"), singleUpload, createProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticated, isAdmin("admin"), singleUpload, updateProduct)
  .delete(isAuthenticated, isAdmin("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticated, createProductReview);
router
  .route("/reviews")
  .get(getProductReview)
  .delete(isAuthenticated, deleteReview);

module.exports = router;
