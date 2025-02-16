export interface LockUpRequest {
    service_id: number;
    coordinate: {
        latitude: string;
        longitude: string;
    };
  }