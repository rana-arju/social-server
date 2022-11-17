const express = require("express");
const jwt = require("jsonwebtoken");
const {
  register,
  login,
  activateAccount,
  sendVerification,
  finduser,
  ResetPasswordCode,
  ValidationResetCode,
  ChangePassword,
} = require("../controllers/user");
const { authUser } = require("../middleware/auth");
const router = express.Router();
router.post("/register", register);
router.post("/activate",authUser, activateAccount);
router.post("/login", login);
router.post("/sendVerification",authUser, sendVerification);
router.post("/finduser", finduser);
router.post("/resetcodeverification", ResetPasswordCode);
router.post("/ValidationResetCode", ValidationResetCode);
router.post("/ChangePassword", ChangePassword);
module.exports = router;
