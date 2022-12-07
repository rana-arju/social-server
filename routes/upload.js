const express = require("express");
const { uploadImages, listImage} = require("../controllers/upload");
const { authUser } = require("../middleware/auth");
const imageUpload = require("../middleware/imageUpload");
const router = express.Router();
router.post("/uploadImages", imageUpload, uploadImages);
router.get("/listImage", listImage);

module.exports = router;
