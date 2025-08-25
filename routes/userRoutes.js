const express = require("express");
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  deleteUser, 
  updateUser, 
  resetPassword 
} = require("../controllers/userController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");

// List users (admin, super_admin, manager)
router.get("/", authenticateJWT, authorizeRoles("admin", "super_admin", "manager"), getAllUsers);

// Get single user (admin, super_admin, manager)
router.get("/:id", authenticateJWT, authorizeRoles("admin", "super_admin", "manager"), getUserById);

// Update user
router.put("/:id", authenticateJWT, authorizeRoles("admin", "super_admin", "manager"), updateUser);

// Reset password
router.put("/:id/reset-password", authenticateJWT, authorizeRoles("admin", "super_admin", "manager"), resetPassword);

// Delete user
router.delete("/:id", authenticateJWT, authorizeRoles("admin", "super_admin", "manager"), deleteUser);

module.exports = router;
