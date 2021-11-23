const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please fill your username"],
  },
  email: {
    type: String,
    required: [true, "Please fill your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, " Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please fill your password"],
    minLength: 6,
    select: false,
  }
});

userSchema.pre("save", async function(next) {
  // check the password if it is modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  typedPassword,
  originalPassword,
) {
  return await bcrypt.compare(typedPassword, originalPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

