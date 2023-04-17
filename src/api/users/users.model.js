const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  validationPassword,
  validationEmail,
} = require("../../utils/validators/validators");
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  surname: { type: String, trim: true, required: true },
  password: { type: String, trim: true, required: true },
  token: { type: String, trim: false, required: false },
  email: { type: String, trim: true, required: true },
  confirmed: { type: Boolean, trim: false, required: false, default: false },
  role: {
    type: String,
    trim: true,
    required: false,
    default: "Regular",
    enum: ["Regular", "Admin"],
  },
  favorites: {
    type: Array,
    trim: true,
    required: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.passwordCheck = async function (formPassword) {
  return bcrypt.compare(formPassword, this.password);
};

const User = mongoose.model("usersWeatherApp", userSchema);
module.exports = User;
