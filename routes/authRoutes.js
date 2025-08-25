const express = require("express");
const router = express.Router();
const { register, login, profile } = require("../controllers/authController");
const { authenticateJWT } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route (example)
router.get("/profile", authenticateJWT, profile);

module.exports = router;
