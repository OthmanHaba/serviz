import axios from 'axios';
import { getItem } from './asyncStorage';

const api = axios.create({
  // baseURL: 'http://serviz-backend.test/api',
  baseURL: 'http://102.213.180.120/api'
  // baseURL: 'http://localhost:8000/api'
});

api.interceptors.request.use(
  async (config) => {
    const token = await getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;