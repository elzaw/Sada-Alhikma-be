const { User } = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// تسجيل مستخدم جديد
const RegisterUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create new user
    const user = User.create({ username, password, role });

    // Return success response
    res.status(201).json({ data: { user } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// تسجيل الدخول
const LoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("Received login request:", { username, password }); // Log the request payload

    const user = await User.findOne({ username });
    console.log("sssss" + user);

    if (!user) {
      console.log("User not found:", username); // Log if user is not found
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", username); // Log if password doesn't match
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error); // Log any unexpected errors
    res.status(400).json({ error: error.message });
  }
};

// تحقق التوكن
const VerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// حذف مستخدم
const DeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { RegisterUser, LoginUser, VerifyToken, DeleteUser };
