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

const acceptOrDeclineRequset = async (id: number, status: 'approved' |'declined') => {
  return await api.post('/service/provider/conform-service', {
    active_request_id:id,
    status: status
  });
}

const refreshServiceForUser = async () => {
  return api.get('/service/user/refresh-active-request');
}

export { getServices,lockup,userApproveActiveRequest,getActiveRequestData ,acceptOrDeclineRequset,refreshServiceForUser};
