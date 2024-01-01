const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cloudinary = require("cloudinary");

// Uncaught Rejections
process.on("uncaughtException", (error) => {
  console.log(`Shutting down the server due to uncaught error`);
  console.log(`Error: ${error.message}`);
  process.exit(1);
});

// Configure Dotenv
dotenv.config({ path: "./backend/config/config.env" });
// Connect Database
connectDB();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
