import axios from 'axios';

export class MLServiceClient {
  constructor(baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8080') {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.retry) return Promise.reject(error);

        config.retryCount = config.retryCount || 0;
        if (config.retryCount >= config.retry) return Promise.reject(error);

        config.retryCount += 1;
        const delay = config.retryCount * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.client(config);
      }
    );
  }

  async predict(features, retries = 3) {
    try {
      console.log('Sending features to ML service:', features);
      const response = await this.client.post('/predict',  features , {
        retry: retries,
        retryCount: 0
      });
      console.log('ML service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ML Service Error:', error.message);
      if (error.response) {
        console.error('ML Service Error Response:', error.response.data);
      }
      // Don't throw - return null to allow graceful degradation
      return null;
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('ML Service Health Check Failed:', error.message);
      return false;
    }
  }

  async getModelInfo() {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error.message);
      return null;
    }
  }
}