const { User } = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const initializeAdmin = async () => {
  try {
    // Check if an admin user already exists
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      console.log("Admin user already exists:", adminUser.username);
      return;
    }

    // Create the admin user
    const hashedPassword = await bcrypt.hash("P@ssw0rd", 10); // Use a strong password in production
    const admin = await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully:", admin.username);
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
};

const resetAdminPassword = async () => {
  try {
    const newPassword = "NewStrongP@ssword123!";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { username: "admin" },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedUser) {
      console.log("Admin password reset successfully.");
    } else {
      console.log("Admin user not found.");
    }
  } catch (error) {
    console.error("Error resetting admin password:", error);
  }
};

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

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found:", username); // Log if user is not found
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", username); // Log if password doesn't match
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error); // Log any unexpected errors
    res.status(500).json({ error: "Something went wrong" });
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

module.exports = {
  RegisterUser,
  LoginUser,
  VerifyToken,
  DeleteUser,
  initializeAdmin,
  resetAdminPassword,
};
