import { verify } from "jsonwebtoken";
// const User = require("../models/users");
import { promisify } from "util";

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "You have to login first" });
  }

  try {
    const decoded = await promisify(verify)(
      authorization,
      process.env.JWT_SECRET
    );

    req.id = decoded.id;

    next();
  } catch (err) {
    res.status(401).json({ message: "You aren't authenticated." });
  }
};

const adminMiddleware = async (req, res, next) => {
  // console.log(req.headers.authorization);
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "You have to login first" });
  }

  try {
    const decode = await promisify(verify)(
      authorization,
      process.env.JWT_SECRET
    );

    if (!decode || decode.role !== "admin") {
      return res.status(400).json({ message: "You don't have access here" });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Permission denied." });
  }
};

export default { authMiddleware, adminMiddleware };
