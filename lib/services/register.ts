import { register } from '../api/register';

export class RegisterService {
    // private readonly apiUrl = 'http://localhost:8000/api/v1/auth/register';
    private VichaleInfo: any;
    private services: any;
    private userInfo: any;

    constructor() {
        this.VichaleInfo = {};
        this.services = [];
        this.userInfo = {};
    }
    setVichaleInfo(data: any) {
        this.VichaleInfo = data;
    }
    setServices(data: any) {
        this.services = data;
    }
    setUserInfo(data: any) {
        this.userInfo = data;
    }

    async register() {
        const data = {
            ...this.userInfo,
            vehicle_info: this.VichaleInfo,
            service_type: this.services
        }
        console.log(data);
        const response = await register(data);
        console.log(response);
        return response;
    }
    
}