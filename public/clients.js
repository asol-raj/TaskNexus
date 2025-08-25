import { axios, log } from "./help.js";

const token = localStorage.getItem("token");
if (!token) {
  alert("Unauthorized. Please log in first.");
  window.location.href = "/login";
}

const clientForm = document.getElementById("clientForm");
const clientTable = document.getElementById("clientTable");

// Load clients
async function loadClients() {
  try {
    const res = await axios.get("/api/clients", {
      headers: { Authorization: `Bearer ${token}` }
    });
    clientTable.innerHTML = res.data
      .map(
        (c) => `
        <tr>
          <td>${c.client_id}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.phone || "-"}</td>
          <td>${c.address || "-"}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteClient(${c.client_id})">Delete</button></td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    log(err);
    alert("Failed to load clients.");
  }
}

// Add client
if (clientForm) {
  clientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/clients",
        {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          phone: document.getElementById("phone").value,
          address: document.getElementById("address").value,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clientForm.reset();
      loadClients();
    } catch (err) {
      log(err);
      alert("Failed to add client.");
    }
  });
}

// Delete client
window.deleteClient = async (id) => {
  if (!confirm("Are you sure you want to delete this client?")) return;
  try {
    await axios.delete(`/api/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadClients();
  } catch (err) {
    log(err);
    alert("Failed to delete client.");
  }
};

// Initial load
loadClients();
