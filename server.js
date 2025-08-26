require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = require("path");
const pool = require("./config/db"); // MySQL connection (mysql2 pool)

const app = express();

// ================== Middleware ==================
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session middleware (used mainly for flash messages)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

// Global variables for flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// ================== Routes ==================
app.use("/", require("./routes/index"));       // Web routes
app.use("/auth", require("./routes/auth"));    // Web auth routes
// app.use("/dashboard", require("./routes/dashboard")); // Web dashboard routes

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// ================== Test DB connection ==================
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB connection error:", err);
  } else {
    console.log("✅ MySQL connected...");
    connection.release();
  }
});

// ================== Start server ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
