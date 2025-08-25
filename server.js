require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
// const { sequelize } = require("./config/db"); // MySQL connection (sequelize instance)
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const clientRoutes = require("./routes/clientRoutes");
app.use("/api/clients", clientRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);



// Initialize app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

// Passport config
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global variables for flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));

// Test DB connection
sequelize
  .authenticate()
  .then(() => console.log("✅ MySQL connected..."))
  .catch((err) => console.error("❌ DB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
