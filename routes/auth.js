const express = require("express");
const router = express.Router();

// Login page
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login - TaskNexus" });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

module.exports = router;
