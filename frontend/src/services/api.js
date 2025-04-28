import axios from 'axios';

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetch data (basic example)
export const fetchData = async () => {
  try {
    const response = await API.get('/data');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cloud Services API
export const getCloudServices = async () => {
  try {
    const [statusResponse, billingResponse] = await Promise.all([
      API.get('/cloud/status'),
      API.get('/cloud/billing'),
    ]);

    return statusResponse.data.map(service => {
      const costData = billingResponse.data;
      return {
        ...service,
        cost: {
          current: service.id === 'azure' ? costData.azure : costData.aws,
          previous: service.id === 'azure' ? costData.azure * 0.9 : costData.aws * 0.9,
          forecast: service.id === 'azure' ? costData.azure * 1.1 : costData.aws * 1.1,
        }
      };
    });
  } catch (error) {
    throw error;
  }
};

export const getServiceMetrics = async (serviceId) => {
  try {
    const endpoint = serviceId === 'azure' ? '/cloud/azure/metrics' : '/cloud/aws/metrics';
    const response = await API.get(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default API;
