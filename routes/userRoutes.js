const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser
} = require("../controllers/userController");

const { authenticateJWT, authorizeRoles } = require("../middlewares/authMiddleware");

// ======================== USER ROUTES ========================

// Get all users (scoped by role)
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("super_admin", "admin", "manager"),
  getAllUsers
);

// Get single user by ID (scoped by role)
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("super_admin", "admin", "manager"),
  getUserById
);

// Update user
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("super_admin", "admin", "manager"),
  updateUser
);

// Reset password
router.put(
  "/:id/reset-password",
  authenticateJWT,
  authorizeRoles("super_admin", "admin", "manager"),
  resetPassword
);

// Delete user
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("super_admin", "admin", "manager"),
  deleteUser
);

module.exports = router;
