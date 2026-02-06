import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000"
});

axiosClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR') {
      console.error('Network Error: Please check your internet connection');
      // You can dispatch to a global error handler or show a toast notification here
    } else if (error.response) {
      // Server responded with error status
      console.error(`Server Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response received from server');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
