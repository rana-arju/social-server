const express = require("express");
const jwt = require("jsonwebtoken");
const { createPost } = require("../controllers/post");
const { authUser } = require("../middleware/auth");
const router = express.Router();
router.post("/createPost", authUser, createPost);

module.exports = router;
