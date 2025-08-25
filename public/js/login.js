import { axios, log } from "./help.js";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await axios.post("/api/auth/login", { email, password });

      // Store JWT in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // Redirect based on role
      switch (res.data.user.role) {
        case "super_admin":
          window.location.href = "/dashboard/super";
          break;
        case "admin":
          window.location.href = "/dashboard/admin";
          break;
        case "manager":
          window.location.href = "/dashboard/manager";
          break;
        case "employee":
          window.location.href = "/dashboard/employee";
          break;
        default:
          alert("Role not recognized!");
      }
    } catch (err) {
      log(err);
      alert(err.response?.data?.msg || "Login failed. Please try again.");
    }
  });
}
