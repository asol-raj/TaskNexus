const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// ✅ Update user (username/email/role)
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const userId = req.params.id;

    let query, params;

    if (req.user.role === "super_admin") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=?";
      params = [username, email, role, userId];
    } else if (req.user.role === "admin") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=? AND `client_id`=?";
      params = [username, email, role, userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=? AND `manager_id`=?";
      params = [username, email, role, userId, req.user.user_id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found or not allowed" });
    }

    res.json({ msg: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ✅ Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let query, params;

    if (req.user.role === "super_admin") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=?";
      params = [hashedPassword, userId];
    } else if (req.user.role === "admin") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=? AND `client_id`=?";
      params = [hashedPassword, userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=? AND `manager_id`=?";
      params = [hashedPassword, userId, req.user.user_id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found or not allowed" });
    }

    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.user_id) {
      return res.status(400).json({ msg: "You cannot delete yourself." });
    }

    let query, params;

    if (req.user.role === "super_admin") {
      query = "DELETE FROM `users` WHERE `id`=?";
      params = [userId];
    } else if (req.user.role === "admin") {
      query = "DELETE FROM `users` WHERE `id`=? AND `client_id`=?";
      params = [userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "DELETE FROM `users` WHERE `id`=? AND `manager_id`=?";
      params = [userId, req.user.user_id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found or not allowed to delete" });
    }

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// ✅ Get all users (with role restrictions)
exports.getAllUsers = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === "super_admin") {
      // Can see everyone
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users`";
      params = [];
    } else if (req.user.role === "admin") {
      // Can see only their company's users
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `client_id`=?";
      params = [req.user.client_id];
    } else if (req.user.role === "manager") {
      // Can see only their direct reports
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `manager_id`=?";
      params = [req.user.user_id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// ✅ Get single user (scoped by role)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    let query, params;

    if (req.user.role === "super_admin") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `id`=?";
      params = [userId];
    } else if (req.user.role === "admin") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `id`=? AND `client_id`=?";
      params = [userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `id`=? AND `manager_id`=?";
      params = [userId, req.user.user_id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ msg: "User not found or not allowed" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
