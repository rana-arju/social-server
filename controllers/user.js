const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationEmail, sendResetCode } = require("../helpers/mailer");
const jwt = require("jsonwebtoken");
const Code = require("../models/Code");
const generateCode = require("../helpers/generateCode");

exports.register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    username,
    password,
    bYear,
    bMonth,
    bDay,
    gender,
  } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: "invalid email address",
    });
  }
  const check = await User.findOne({ email });
  if (check) {
    return res.status(400).json({
      message:
        "This email address already exists,try with a different email address",
    });
  }
  if (!validateLength(first_name, 3, 30)) {
    return res.status(400).json({
      message: "first name must between 3 and 30 characters.",
    });
  }
  if (!validateLength(last_name, 3, 30)) {
    return res.status(400).json({
      message: "last name must between 3 and 30 characters.",
    });
  }
  if (!validateLength(password, 6, 40)) {
    return res.status(400).json({
      message: "password must be atleast 6 characters.",
    });
  }
  const cryptedPassword = await bcrypt.hash(password, 12);
  let tempUsername = first_name + last_name;
  let newUsername = await validateUsername(tempUsername);
  const user = await new User({
    first_name,
    last_name,
    email,
    password: cryptedPassword,
    username: newUsername,
    bYear,
    bMonth,
    bDay,
    gender,
  }).save();
  // const emailVerificationToken = generateToken(
  //   { id: user._id.toString() },
  //   "30m"
  // );
  // const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
  // sendVerificationEmail(user.email, user.first_name, url);

  const token = generateToken({ id: user._id.toString() }, "7d");
  res.send({
    id: user._id,
    username: user.username,
    picture: user.picture,
    first_name: user.first_name,
    last_name: user.last_name,
    token: token,
    verified: user.verified,
    message: "Register Success!",
    // message: "Register Success! Please activate Your email to start",
  });
};
exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user._id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (validUser !== user) {
      return res.status(400).json({
        message: "You don't have the authorization to complate this operation!",
      });
    }

    if (check.verified === true) {
      return res
        .status(400)
        .json({ message: "this email is already activated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "account has been activate successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "the email address you entered is not connected to an account",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials. Please try again",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Login Success!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sendVerification = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res.status(400).json({
        message: "This account is already activate!",
      });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    return res.status(400).json({
      message: "Email verification link has been send your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.finduser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "Account does not exist",
      });
    }
    return res.status(200).json({ email: user.email, picture: user.picture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);
    const saveCode = await new Code({
      code,
      user: user._id,
    }).save();
    sendResetCode(user.email, user.first_name, code);
    return res.status(200).json({
      message: "Password reset code is send your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ValidationResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const Dbcode = await Code.findOne({ user: user._id });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong",
      });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ChangePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email }, { password: cryptedPassword });
     return res.status(200).json({
       message: "Password Succefully Updated",
     });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
