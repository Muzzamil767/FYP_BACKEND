const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("../middlewares/catchAsyncErrors");

// Create New Order
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingInfo, orderItems } = req.body;

  let totalPrice = req.body.orderItems.reduce(
    (acc, item) => item.price * item.quantity + acc,
    0
  );

  totalPrice = totalPrice + 1;

  shippingInfo.pincode = Number(shippingInfo.pincode);
  shippingInfo.phonenumber = Number(shippingInfo.phonenumber);

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paidAt: Date.now(),
    userId: req.user._id,
    totalPrice,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get Single Order
exports.getSingleOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order)
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );
  res.status(200).json({
    success: true,
    order,
  });
});

// Get Logged In user Order
exports.myOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Update Order Status (Admin)
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler("You have already delivered the product", 400)
    );
  }

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

// delete Order -- Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

// Update Stock
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
