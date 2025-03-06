import api from "../axios";
import { LockUpRequest } from "@/types";

const getServices = async () => {
  const response = await api.get("/service");
  return response.data;
};

const lockup = async (data: LockUpRequest) => {
  return await api.post("/service/lockup-service",data);
};

const userApproveActiveRequest = async (id: number) => {
  return await api.post('/service/user/conform-service',{
    'active_request_id' : id
  });
}

const getActiveRequestData = async (id :number) => {
  return await api.get(`/service/track/get-status?active_request_id=${id}`)
}

const acceptOrDeclineRequset = async (id: number) => {
  
}

export { getServices,lockup,userApproveActiveRequest,getActiveRequestData ,acceptOrDeclineRequset};
