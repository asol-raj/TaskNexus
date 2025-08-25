import '../scripts/jquery.js';
import '../scripts/axios.js';
import 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
import formFields from './formFields.js';

export const log = console.log;
export const jq = jQuery;
export const axios = window.axios;

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))