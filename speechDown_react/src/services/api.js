import axios from 'axios';

// URL base de tu backend Flask
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // ajusta si cambias puerto
});

export default api;

