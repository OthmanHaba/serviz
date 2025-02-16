import api from "../axios";
import { LockUpRequest } from "@/types";

const getServices = async () => {
  const response = await api.get("/service");
  return response.data;
};

const lockup = async (data: LockUpRequest) => {
  return await api.post("/service/lockup-service");
};

export { getServices,lockup };
