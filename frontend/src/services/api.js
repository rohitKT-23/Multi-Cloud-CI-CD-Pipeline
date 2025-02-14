import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
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
