import { getServices } from '@/lib/api/service';
import { create } from 'zustand';

interface Service {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface ServiceStore {
  services: Service[];
  selectedService: Service | null;
  fetchServices: () => Promise<void>;
  setSelectedService: (service: Service) => void;
}

const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  selectedService: null,
  fetchServices: async () => {
    const services = await getServices();
    set({ services: services.data });
  },
  setSelectedService: (service: Service) => {
    set({ selectedService: service });
  },
}));

export default useServiceStore;