import { axios, log, showAlert, getAuthToken } from "./help.js";

const form = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    email: form.email.value.trim(),
    password: form.password.value.trim(),
  };

  try {
    const res = await axios.post("/auth/login", formData);

    // Save token + user in localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    showAlert("success", "Login successful! Redirecting...");

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "/dashboard"; // change path if needed
    }, 1000);

  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.msg || "Invalid credentials";
    showAlert("danger", msg);
  }
});