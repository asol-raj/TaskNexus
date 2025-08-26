const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// ======================== REGISTER ========================
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, client_id, manager_id } = req.body;

    // Only admins, super_admin, managers can register
    if (!["admin", "super_admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied. Only admins/managers can register users." });
    }

    // Check for duplicate email
    const [existing] = await pool.query("SELECT * FROM `users` WHERE `email` = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedClientId = null;
    let assignedManagerId = null;

    if (req.user.role === "super_admin") {
      // Super admin can assign any client_id or null for internal staff
      assignedClientId = client_id || null;
      assignedManagerId = manager_id || null;
    } else if (req.user.role === "admin") {
      // Admin must stick to their own client
      assignedClientId = req.user.client_id;
      assignedManagerId = manager_id || null;
    } else if (req.user.role === "manager") {
      // Manager can only create employees under their team
      assignedClientId = req.user.client_id;
      assignedManagerId = req.user.id;
    }

    const [result] = await pool.query(
      "INSERT INTO `users` (`username`, `email`, `password_hash`, `role`, `client_id`, `manager_id`) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role, assignedClientId, assignedManagerId]
    );

    res.status(201).json({ msg: "User registered successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== LOGIN ========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM `users` WHERE `email` = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ msg: "Invalid credentials" });

    const user = rows[0];

    // Check password against password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Sign JWT (short payload, always refreshes DB in middleware)
    const token = jwt.sign(
      { id: user.id, role: user.role, client_id: user.client_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        client_id: user.client_id,
        manager_id: user.manager_id,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== PROFILE ========================
exports.profile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id` FROM `users` WHERE `id` = ?",
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ msg: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
