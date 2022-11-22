const express = require("express");
const jwt = require("jsonwebtoken");
const { createPost, getAllPost } = require("../controllers/post");
const { authUser } = require("../middleware/auth");
const router = express.Router();
router.post("/createPost", authUser, createPost);
router.get("/getAllPost", getAllPost);

module.exports = router;
