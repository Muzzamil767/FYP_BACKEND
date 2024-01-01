const express = require("express");
const { submitPrescription, getAllPrescriptions } = require("../controllers/prescriptionControllers");
const { isAuthenticated , isAdmin } = require("../middlewares/auth");
const singleUpload = require("../middlewares/multer");


const router = express.Router();

router.route('/submit').post(isAuthenticated, singleUpload,  submitPrescription);
router.route('/all').get(isAuthenticated, isAdmin("admin"), getAllPrescriptions)


module.exports = router;