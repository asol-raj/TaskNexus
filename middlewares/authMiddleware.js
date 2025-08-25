const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Verify JWT
exports.authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403);

    try {
      // Always fetch fresh user info from DB
      const [rows] = await pool.query(
        "SELECT `id`, `username`, `email`, `role`, `client_id`, `manager_id` FROM `users` WHERE `id` = ?",
        [decoded.user_id]
      );

      if (rows.length === 0) return res.status(404).json({ msg: "User not found" });

      req.user = {
        user_id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email,
        role: rows[0].role,
        client_id: rows[0].client_id,
        manager_id: rows[0].manager_id
      };

      next();
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).send("Server error");
    }
  });
};

// Role-based authorization
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};
