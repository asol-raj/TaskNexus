const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// ======================== GET ALL USERS ========================
exports.getAllUsers = async (req, res) => {
  try {
    let query, params;

    if (req.user.role === "super_admin") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users`";
      params = [];
    } else if (req.user.role === "admin") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `client_id`=?";
      params = [req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id`, `created_at` FROM `users` WHERE `manager_id`=?";
      params = [req.user.id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== GET USER BY ID ========================
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
      params = [userId, req.user.id];
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
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== UPDATE USER ========================
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    let query, params;

    if (req.user.role === "super_admin") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=?";
      params = [username, email, role, userId];
    } else if (req.user.role === "admin") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=? AND `client_id`=?";
      params = [username, email, role, userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "UPDATE `users` SET `username`=?, `email`=?, `role`=? WHERE `id`=? AND `manager_id`=?";
      params = [username, email, role, userId, req.user.id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found or not allowed" });

    res.json({ msg: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== RESET PASSWORD ========================
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let query, params;

    if (req.user.role === "super_admin") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=?";
      params = [hashedPassword, userId];
    } else if (req.user.role === "admin") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=? AND `client_id`=?";
      params = [hashedPassword, userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "UPDATE `users` SET `password_hash`=? WHERE `id`=? AND `manager_id`=?";
      params = [hashedPassword, userId, req.user.id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found or not allowed" });

    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ======================== DELETE USER ========================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    let query, params;

    if (req.user.role === "super_admin") {
      query = "DELETE FROM `users` WHERE `id`=?";
      params = [userId];
    } else if (req.user.role === "admin") {
      query = "DELETE FROM `users` WHERE `id`=? AND `client_id`=?";
      params = [userId, req.user.client_id];
    } else if (req.user.role === "manager") {
      query = "DELETE FROM `users` WHERE `id`=? AND `manager_id`=?";
      params = [userId, req.user.id];
    } else {
      return res.status(403).json({ msg: "Access denied." });
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User not found or not allowed" });

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
