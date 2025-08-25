const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER
// In authController.js -> register
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, client_id, manager_id } = req.body;

    // Only super_admin, admin, and manager can register
    if (!["super_admin", "admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied. Only admins/managers can register users." });
    }

    // Check for duplicate email
    const [existing] = await pool.query("SELECT * FROM `users` WHERE `email` = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedClientId, assignedManagerId;

    if (req.user.role === "super_admin") {
      // Super admin can assign any client (or NULL for internal staff)
      assignedClientId = client_id || null;
      assignedManagerId = manager_id || null;

    } else if (req.user.role === "admin") {
      // Admin must stick to their own client_id
      assignedClientId = req.user.client_id;
      assignedManagerId = manager_id || null;

    } else if (req.user.role === "manager") {
      // Manager can only create employees in their own client,
      // and must auto-assign themselves as the manager
      assignedClientId = req.user.client_id;
      assignedManagerId = req.user.id;  // logged-in manager's user id
    }

    // Insert new user
    const [result] = await pool.query(
      "INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `client_id`, `manager_id`) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role, assignedClientId, assignedManagerId]
    );

    res.status(201).json({
      msg: "User registered successfully",
      user_id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const [rows] = await pool.query("SELECT * FROM `users` WHERE `email` = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ msg: "Invalid credentials" });

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Sign JWT
    const token = jwt.sign(
      {
        user_id: user.id,         // use `id` from schema
        role: user.role,
        client_id: user.client_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with token + user info
    res.json({
      token,
      user: {
        user_id: user.id,
        role: user.role,
        client_id: user.client_id,
        username: user.username,
        manager_id: user.manager_id || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// PROFILE (protected example)
exports.profile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id` FROM `users` WHERE `id` = ?",
      [req.user.user_id]  // still comes from JWT payload
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
