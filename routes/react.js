const express = require("express");
const { reactPost } = require("../controllers/react");
const { authUser } = require("../middleware/auth");

const router = express.Router();
router.put("/reactPost", reactPost);
// router.get("/getReacts/:id", authUser, getReacts);
module.exports = router;
