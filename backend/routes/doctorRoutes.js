const express = require("express");
const singleUpload = require("../middlewares/multer");
const {
  registerDoctor,
  loginDoctor,
  getDoctorDetails,
  getAllDoctors,
  getSingleDoctor,
} = require("../controllers/doctorControllers");
const { logoutUser } = require("../controllers/userControllers");
const { isAuthenticatedDoc } = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(singleUpload, registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/logout").get(logoutUser);
router.route("/me").get(isAuthenticatedDoc, getDoctorDetails);
router.route("/all").get(getAllDoctors);
router.route("/:id").get(getSingleDoctor);

module.exports = router;
