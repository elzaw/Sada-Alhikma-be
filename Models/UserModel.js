const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // اسم المستخدم
    password: { type: String, required: true }, // كلمة المرور
    role: { type: String, enum: ["admin", "employee"], default: "employee" }, // دور المستخدم
  },
  { collection: "User", timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // ✅ Skip hashing if password wasn't changed
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
