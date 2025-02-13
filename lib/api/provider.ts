import axios from '../axios';

export const toggleActiveStatus = async (isActive: boolean) => {
  const response = await axios.post('/provider/toggle-active', {
    is_active: isActive,
  });
  return response.data;
};
