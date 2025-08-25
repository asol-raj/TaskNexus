import { axios, log } from "./help.js";

const form = document.getElementById("registerForm");
const clientSelectWrapper = document.getElementById("clientSelectWrapper");
const clientSelect = document.getElementById("client_id");

const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// If super_admin, show client dropdown and load clients
async function loadClients() {
  try {
    const res = await axios.get("/api/clients", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Populate dropdown
    res.data.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.client_id;
      option.textContent = `${c.name} (ID: ${c.client_id})`;
      clientSelect.appendChild(option);
    });
  } catch (err) {
    log(err);
    alert("Failed to load clients.");
  }
}

if (role === "super_admin" && clientSelectWrapper) {
  clientSelectWrapper.classList.remove("d-none");
  loadClients();
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Unauthorized. Please log in first.");
      return (window.location.href = "/login");
    }

    const userData = {
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    if (role === "super_admin") {
      userData.client_id = clientSelect.value || null;
    }

    try {
      const res = await axios.post("/api/auth/register", userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(res.data.msg);
      form.reset();
    } catch (err) {
      log(err);
      alert(err.response?.data?.msg || "Registration failed.");
    }
  });
}
