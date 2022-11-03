const express = require("express");
const jwt = require("jsonwebtoken");
const { register, login, activateAccount } = require("../controllers/user");
const router = express.Router();
router.post("/register", register )
router.post("/login", login )
router.post("/activate", activateAccount )







module.exports = router;