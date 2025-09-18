import axiosInstance, { AxiosInstance } from 'axios';

class KambanizeService {
  private axios: AxiosInstance;

  constructor() {
    console.log({ u: process.env.KAMBANIZE_HOST });
    this.axios = axiosInstance.create({
      baseURL: process.env.KAMBANIZE_HOST ?? '',
    });
  }

  public async getAllCards(): Promise<void> {
    const { data } = await this.axios.get('/get-details');

    return data;
  }
}

export { KambanizeService };
