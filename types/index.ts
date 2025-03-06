export interface LockUpRequest {
  service_id: number;
  coordinate: {
    latitude: string;
    longitude: string;
  };
}

export interface Provider {
  id: number;
  name: string;
  email: string;
  remember_token: string | null;
  email_verified_at: string | null;
  phone: string;
  vehicle_info: {
    vehicleType: string;
    vehicleModel: string;
    vehicleYear: string;
  };
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  current_location: {
    id: number;
    user_id: number;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
  };
  provider_services: Array<{
    id: number;
    user_id: number;
    servic_type_id: number;
    price: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface ActiveRequest {
    id: number;
    user_id: number;
    provider_id: number;
    price: string;
    status: string;
    created_at: string;
    updated_at: string;
}
