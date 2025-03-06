import axios from '../axios';

export const toggleActiveStatus = async (isActive: boolean) => {
  const response = await axios.post('/provider/toggle-active', {
    is_active: isActive,
  });
  return response.data;
};

export const updateLocation = async (latitude: number, longitude: number) => {
  const response = await axios.post('/provider/update-location', {
    lat: latitude,
    long: longitude,
  });
  console.log(response.data);
  return response.data;
};

export const updateExpoToken = async (token: string) =>  {
  return await axios.post('/provider/update-expo-token',token);
}

export const getActiveRequests = async () => {
  return await axios.get('/provider/active-request');
}