import axios from '../axios';

export const register = async (data: any) => {
  const response = await axios.post('/register', data);
  return response.data;
};