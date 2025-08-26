import '../scripts/jquery.js';
import '../scripts/axios.js';
import 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
import formFields from './formFields.js';

export const log = console.log;
export const jq = jQuery;
export const axios = window.axios;

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


// Show Bootstrap alerts
export function showAlert(type, message) {
  const box = document.getElementById("alertBox");
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 4000);
}

// Get token/user from localStorage
export function getAuthToken() {
  return localStorage.getItem("token");
}

export function getAuthUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : {};
}
