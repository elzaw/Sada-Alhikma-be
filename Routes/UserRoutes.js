const express = require("express");

const {
  RegisterUser,
  LoginUser,
  VerifyToken,
} = require("../Controllers/UserController");

const router = express.Router();

router.route("/").post(RegisterUser);

router.route("/login").post(LoginUser);

router.route("/verifyToken").get(VerifyToken);

module.exports = router;
