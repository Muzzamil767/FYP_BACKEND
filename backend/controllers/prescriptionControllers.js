const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("../middlewares/catchAsyncErrors");
const Prescription = require("../models/prescriptionModel");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/dataUri");

exports.submitPrescription = asyncHandler(async (req, res, next) => {

    const file = req.file;

    if(!file) {
        return next(new ErrorHandler("Prescription is Required." , 400))
    }

    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Prescription.create({
        image: {
            public_id: myCloud.public_id,
            url: myCloud.url
        },
        patient: req.user._id
    });

    res.status(200).json({
        success: true,
        message: "Prescription Submitted."
    })

});

exports.getAllPrescriptions = asyncHandler(async (req, res, next) => {

    const prescriptions = await Prescription.find().populate("patient" , "name email avatar");

    res.status(200).json({
        success: true,
        prescriptions
    })

});

