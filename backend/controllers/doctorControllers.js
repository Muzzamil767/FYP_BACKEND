const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("../middlewares/catchAsyncErrors");
const Doctor = require("../models/doctorModel");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/dataUri");
const sendToken = require("../utils/sendToken");

// Register Doctor
exports.registerDoctor = asyncHandler(async (req, res, next) => {
  const { name, email, password, qualification, specialization, bio, timings } =
    req.body;
  const file = req.file;

  if (
    !name ||
    !email ||
    !password ||
    !qualification ||
    !specialization ||
    !file
  ) {
    return next(
      new ErrorHandler(
        "Name, Email, Password, Profile Picture, Qualification and Specialization are Required.",
        400
      )
    );
  }

  const isExists = await Doctor.findOne({ email });

  if (isExists) {
    return next(
      new ErrorHandler("Doctor Already Exists with this Email.", 400)
    );
  }

  // Upload Image on Cloudinary
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  const doctor = await Doctor.create({
    name,
    email,
    password,
    qualification,
    specialization,
    bio,
    timings,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.url,
    },
  });

  sendToken(doctor, 201, res);
});

// Login Doctor
exports.loginDoctor = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Checking if User has given both email and password
  if (!email || !password)
    return next(new ErrorHandler("Please enter both email and password", 400));

  // Check if User not exists
  const user = await Doctor.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

  // Check if password matched or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Email or Password", 400));

  sendToken(user, 200, res);
});

// Get Doctor Profile
exports.getDoctorDetails = asyncHandler(async (req, res, next) => {
  const user = await Doctor.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Get all doctors - Public
exports.getAllDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find().select("-password");
  res.status(200).json({
    success: true,
    doctors,
  });
});

// Get single Doctor - public
exports.getSingleDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new ErrorHandler("No Doctor Found with given ID.", 404));
  }
  res.status(200).json({
    success: true,
    doctor,
  });
});
