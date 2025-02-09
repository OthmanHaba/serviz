import axios from 'axios';

const api = axios.create({
  baseURL: 'https://38b5-208-115-193-34.ngrok-free.app/api',
});

export default api;