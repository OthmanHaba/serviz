import { getServices } from '@/lib/api/service';
import { create } from 'zustand';

interface Service {
  id: string;
  title: string;
  image: string;
  description: string;
}

interface ServiceStore {
  services: Service[];
  fetchServices: () => Promise<void>;
}

const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  fetchServices: async () => {
    const services = await getServices();
    set({ services: services.data });
  },
}));

export default useServiceStore;