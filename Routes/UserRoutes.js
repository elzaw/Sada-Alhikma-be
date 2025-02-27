const express = require("express");

const {
  RegisterUser,
  LoginUser,
  VerifyToken,
} = require("../Controllers/UserController");
const { adminMiddleware } = require("../Middlewares/authMiddleware");
const router = express.Router();

router.route("/").post(adminMiddleware, RegisterUser);

router.route("/login").post(LoginUser);

router.route("/verifyToken").get(VerifyToken);

module.exports = router;
