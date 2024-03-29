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
  getProfile,
  updateProfilePicture,
  updateProfileCover,
  userDetailsUpdate,
  addFriend,
  cancelRequest,
  unFollow,
  follow,
  acceptRequest,
  unfriend,
  deleteRequest,
  search,
  addToSearchHistory,
  getToSearchHistory,
  deleteSearchHistory,
  getFriendRequestsPageInfos,
} = require("../controllers/user");
const { authUser } = require("../middleware/auth");
const router = express.Router();
router.post("/register", register);
router.post("/activate", authUser, activateAccount);
router.post("/login", login);
router.post("/sendVerification", authUser, sendVerification);
router.post("/finduser", finduser);
router.post("/resetcodeverification", ResetPasswordCode);
router.post("/ValidationResetCode", ValidationResetCode);
router.post("/ChangePassword", ChangePassword);
router.get("/getProfile/:username", authUser, getProfile);
router.put("/updateProfilePicture", authUser, updateProfilePicture);
router.put("/updateProfileCover", authUser, updateProfileCover);
router.put("/userDetailsUpdate", authUser, userDetailsUpdate);
router.put("/addFriend/:id", authUser, addFriend);
router.put("/cancelRequest/:id", authUser, cancelRequest);
router.put("/follow/:id", authUser, follow);
router.put("/unFollow/:id", authUser, unFollow);
router.put("/acceptRequest/:id", authUser, acceptRequest);
router.put("/unfriend/:id", authUser, unfriend);
router.put("/deleteRequest/:id", authUser, deleteRequest);
router.post("/search/:searchTerm", authUser, search);
router.put("/addToSearchHistory", authUser, addToSearchHistory);
router.get("/getToSearchHistory", authUser, getToSearchHistory);
router.put("/deleteSearchHistory", authUser, deleteSearchHistory);
router.get("/getFriendRequestsPageInfos", authUser, getFriendRequestsPageInfos);
module.exports = router;
