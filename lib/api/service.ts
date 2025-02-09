import api from '../axios';

const getServices = async () => {
  const response = await api.get('/service');
  return response.data;
};

export { getServices };