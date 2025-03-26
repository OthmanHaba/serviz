import axios from 'axios';
import { getItem } from './asyncStorage';

const api = axios.create({
  // baseURL: 'http://serviz-backend.test/api',
  baseURL: 'https://53vhfestxu.sharedwithexpose.com/api'
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