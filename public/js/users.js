import { axios, log } from "./help.js";

const token = localStorage.getItem("token");
if (!token) {
  alert("Unauthorized. Please log in first.");
  window.location.href = "/login";
}

const userTable = document.getElementById("userTable");

// Load users
async function loadUsers() {
  try {
    const res = await axios.get("/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    userTable.innerHTML = res.data
      .map(
        (u) => `
        <tr>
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.client_id || "-"}</td>
          <td>
            <button class="btn btn-sm btn-info" onclick="openEditModal(${u.id}, '${u.username}', '${u.email}', '${u.role}')">Edit</button>
            <button class="btn btn-sm btn-warning" onclick="openResetModal(${u.id})">Reset Password</button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    log(err);
    alert("Failed to load users.");
  }
}

// Delete user
window.deleteUser = async (id) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await axios.delete(`/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadUsers();
  } catch (err) {
    log(err);
    alert(err.response?.data?.msg || "Failed to delete user.");
  }
};

// Open Edit Modal
window.openEditModal = (id, username, email, role) => {
  document.getElementById("edit_user_id").value = id;
  document.getElementById("edit_username").value = username;
  document.getElementById("edit_email").value = email;
  document.getElementById("edit_role").value = role;
  new bootstrap.Modal(document.getElementById("editUserModal")).show();
};

// Submit Edit User
document.getElementById("editUserForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("edit_user_id").value;
    const payload = {
      username: document.getElementById("edit_username").value,
      email: document.getElementById("edit_email").value,
      role: document.getElementById("edit_role").value
    };

    await axios.put(`/api/users/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("User updated successfully");
    loadUsers();
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
  } catch (err) {
    log(err);
    alert(err.response?.data?.msg || "Failed to update user.");
  }
});

// Open Reset Password Modal
window.openResetModal = (id) => {
  document.getElementById("reset_user_id").value = id;
  new bootstrap.Modal(document.getElementById("resetPasswordModal")).show();
};

// Submit Reset Password
document.getElementById("resetPasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById("reset_user_id").value;
    const payload = { password: document.getElementById("new_password").value };

    await axios.put(`/api/users/${id}/reset-password`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("Password reset successfully");
    loadUsers();
    bootstrap.Modal.getInstance(document.getElementById("resetPasswordModal")).hide();
  } catch (err) {
    log(err);
    alert(err.response?.data?.msg || "Failed to reset password.");
  }
});

// Initial load
loadUsers();
