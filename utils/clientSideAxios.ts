import axios from "axios";

const clientSideAxios = axios.create({
  baseURL: "https://dev-bixfit-backend-new-407792198674.asia-southeast1.run.app/api/v1",
  timeout: 10000,
});

clientSideAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("x-auth-token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

export default clientSideAxios;