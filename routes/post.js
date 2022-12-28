const express = require("express");
const jwt = require("jsonwebtoken");
const { createPost, getAllPost, comment } = require("../controllers/post");
const { authUser } = require("../middleware/auth");
const router = express.Router();
router.post("/createPost", authUser, createPost);
router.get("/getAllPost",authUser, getAllPost);
router.put("/comment",authUser, comment);

module.exports = router;
