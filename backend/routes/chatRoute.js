const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authenticateToken = require("../middleware/authToken");

router.post("/save", authenticateToken, chatController.saveChat);
router.get("/history", authenticateToken, chatController.getHistory);

module.exports = router;
