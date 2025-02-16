import axios from "../axios"

export const requestService = async (data: any) => {
    const response = await axios.post('/service/lockup-service', data);
    return response.data;
  };