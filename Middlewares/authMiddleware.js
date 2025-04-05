const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "You have to login first" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    req.id = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "You aren't authenticated." });
  }
};

const adminMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "You have to login first" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "You don't have access here" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Permission denied." });
  }
};

module.exports = { authMiddleware, adminMiddleware };
