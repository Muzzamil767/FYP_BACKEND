const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("../middlewares/catchAsyncErrors");
const Appointment = require("../models/appointmentModel");
const sendEmail = require("../utils/sendEmail");

// Create new Appointment - private
exports.createNewAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, message } = req.body;
  if (!message) {
    return next(new ErrorHandler("A 20 Character reason is Required.", 400));
  }

  const newAppointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    message,
  });

  res.status(200).json({
    success: true,
    message: "Appointment Placed Successfully.",
  });
});

// Get All Appointments - Private (Doc)
exports.getAllAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({
    doctor: req.user._id,
  }).populate("patient", "name avatar email");
  res.status(200).json({
    success: true,
    appointments,
  });
});

// Accept appointment
exports.acceptAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id).populate(
    "patient",
    "email name"
  );
  if (!appointment) {
    return next(
      new ErrorHandler("No Appointment Found with the given Id", 400)
    );
  }

  appointment.status = "accepted";

  await appointment.save();

  const message = `Hi ${appointment.patient.name},\nThis email is to inform you that your appointment request to Doctor ${req.user.name} is successfully accepted. You will shortly receive an Phone call from our team for further details.\nThanks.\nRegards, Doctor ${req.user.name}`;

  await sendEmail({
    email: appointment.patient.email,
    message,
    subject: "Appointment Acceptance Notification",
  });

  res.status(200).json({
    success: true,
    message: "Accepted Successfully",
  });
});

// Reject Appointment
exports.rejectAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id).populate(
    "patient",
    "email name"
  );
  if (!appointment) {
    return next(
      new ErrorHandler("No Appointment Found with the given Id", 400)
    );
  }

  appointment.status = "rejected";

  await appointment.save();

  const message = `Hi ${appointment.patient.name},\nThis email is to inform you that your appointment request to Doctor ${req.user.name} is rejected as your problem does not matched the doctor's experties. You will shortly receive an Phone call from our team for further details.\nThanks.\nRegards, Doctor ${req.user.name}`;

  await sendEmail({
    email: appointment.patient.email,
    message,
    subject: "Appointment Rejection Notification",
  });

  res.status(200).json({
    success: true,
    message: "Rejected Successfully",
  });
});

// Get Active Appointments - Private
exports.getActiveAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({
    status: "accepted",
    doctor: req.user._id,
  }).populate("patient", "name avatar email");

  res.status(200).json({
    success: true,
    appointments,
  });
});

// Mark as Done - Private
exports.markAsDone = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id).populate(
    "patient",
    "email name"
  );
  if (!appointment) {
    return next(
      new ErrorHandler("No Appointment Found with the given Id", 400)
    );
  }

  await appointment.remove();

  const message = `Hi ${appointment.patient.name},\nWe are glad that you choose us for the 1:1 session.Your appointment session have been successfully finished.Have a nice day.\nThanks.\nRegards, Doctor ${req.user.name}`;

  await sendEmail({
    email: appointment.patient.email,
    message,
    subject: "Thanks For Appointment",
  });

  res.status(200).json({
    success: true,
    message: "Marked as Done Successfully",
  });
});
