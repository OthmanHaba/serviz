import axios from '../axios';
import { setItem } from '../asyncStorage';

export const login = async (data: any) => {
  const res = await axios.post('/login', data);
  if (res.data.token) {
    await setItem('token', res.data.token);
  }
  return res;
};
