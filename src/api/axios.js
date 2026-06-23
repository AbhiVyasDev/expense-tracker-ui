import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  const publicEndpoints = [
    "/auth/login",
    "/auth/register"
  ];

  const isPublicEndpoint = publicEndpoints.some(
    endpoint => config.url?.includes(endpoint)
  );

  if (token && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;