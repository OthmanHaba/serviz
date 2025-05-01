import api from "../axios";
// import axios from "../axios";

export const requestService = async (data: any) => {
  const response = await api.post("/service/lockup-service", data);
  return response.data;
};


export const completeActiveRequest = async (id: number , paymentMethod : string) => {
  return api.post('/service/active-request/complete', {
    active_request_id: id,
    payment_method : paymentMethod
  });
}