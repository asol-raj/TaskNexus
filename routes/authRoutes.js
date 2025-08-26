const express = require("express");
const router = express.Router();
const { register, login, profile } = require("../controllers/authController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

// ======================== AUTH ROUTES ========================

// Register new user (only admins, super_admins, managers allowed)
router.post("/register", authenticateJWT, register);

// Login
router.post("/login", login);

// Profile (requires authentication)
router.get("/profile", authenticateJWT, profile);

module.exports = router;
