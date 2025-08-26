const express = require("express");
const router = express.Router();
const { getClients, addClient, deleteClient } = require("../controllers/clientController");
const { authenticateJWT, authorizeRoles } = require("../middlewares/authMiddleware");

// Only super_admin can manage clients
router.get("/", authenticateJWT, authorizeRoles("super_admin"), getClients);
router.post("/", authenticateJWT, authorizeRoles("super_admin"), addClient);
router.delete("/:id", authenticateJWT, authorizeRoles("super_admin"), deleteClient);

module.exports = router;
