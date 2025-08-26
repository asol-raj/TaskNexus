import { showAlert, getAuthUser, getAuthToken } from "./help.js";

const form = document.getElementById("registerForm");
const clientGroup = document.getElementById("clientGroup");
const managerGroup = document.getElementById("managerGroup");

// Get logged-in user role
const currentUser = getAuthUser(); // stored in localStorage after login

// Show/hide fields based on role
if (currentUser.role === "super_admin") {
  clientGroup.classList.remove("d-none");
  managerGroup.classList.remove("d-none");
} else if (currentUser.role === "admin") {
  managerGroup.classList.remove("d-none");
  // client_id auto-filled (admin’s own), no need to show
} else if (currentUser.role === "manager") {
  // Manager cannot see client/manager fields
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value.trim(),
    role: form.role.value
  };

  // Only super_admin can assign client_id
  if (currentUser.role === "super_admin" && form.client_id.value) {
    formData.client_id = form.client_id.value;
  }

  // Admin and super_admin can assign manager_id
  if ((currentUser.role === "super_admin" || currentUser.role === "admin") && form.manager_id.value) {
    formData.manager_id = form.manager_id.value;
  }

  try {
    const res = await axios.post("/auth/register", formData, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });

    showAlert("success", res.data.msg || "User registered successfully");
    form.reset();
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.msg || "Registration failed";
    showAlert("danger", msg);
  }
});
