import axios from "axios";

// Jest ke liye process.env use karna hoga
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchData = async () => {
  try {
    const response = await API.get("/data");
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default API;

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);