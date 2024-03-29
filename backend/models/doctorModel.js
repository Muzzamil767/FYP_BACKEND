const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Name cannot be longer then 30 characters"],
      minLength: [4, "Name cannot be shorter then 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "Please enter valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password should be greater then 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "doctor",
    },
    bio: { type: String, default: "Doctor haven't added bio yet." },
    qualification: {
      type: String,
      required: [true, "Qualification is Required."],
    },
    specialization: {
      type: String,
      required: [true, "Specialization is Required."],
    },
    timings: {
      type: String,
      required: [true, "Timings are Required."],
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt Doctor password
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
doctorSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JSON web token
doctorSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
