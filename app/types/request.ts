export interface Provider {
  id: string;
  name: string;
  rating: number;
  phone: string;
  current_location: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string;
  name: string;
  role?: string;
  current_location: {
    latitude: number;
    longitude: number;
  };
}

export interface ServiceRequest {
  id: number;
  status: 'PendingUserApproved' | 'PendingProviderApproved' | 'InProgress' | 'Completed' | 'Cancelled';
  serviceType: string;
  provider: Provider;
  user: User;
  createdAt: string;
  estimatedArrival?: string;
} 