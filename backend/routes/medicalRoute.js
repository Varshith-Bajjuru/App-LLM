const express = require("express");
const router = express.Router();
const medicalController = require("../controllers/medicalController");
const authenticateToken = require("../middleware/authToken");

router.post("/", authenticateToken, medicalController.handleMedicalQuery);

module.exports = router;
