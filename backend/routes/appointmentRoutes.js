const express = require("express");
const { isAuthenticated, isAuthenticatedDoc } = require("../middlewares/auth");
const {
  createNewAppointment,
  getAllAppointments,
  acceptAppointment,
  rejectAppointment,
  getActiveAppointments,
  markAsDone,
} = require("../controllers/appointmentControllers");

const router = express.Router();

router.route("/new").post(isAuthenticated, createNewAppointment);
router.route("/all").get(isAuthenticatedDoc, getAllAppointments);
router
  .route("/:id")
  .put(isAuthenticatedDoc, acceptAppointment)
  .delete(isAuthenticatedDoc, rejectAppointment);

router.route("/active/all").get(isAuthenticatedDoc, getActiveAppointments);
router.route("/done/:id").delete(isAuthenticatedDoc, markAsDone);

module.exports = router;
