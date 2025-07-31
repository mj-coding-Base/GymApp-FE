import axios, { AxiosError } from "axios";
import { getSession } from "@/lib/authentication";

const isServer = typeof window === "undefined";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(async (request) => {
  try {
    let token: string | null | undefined = null;
    let gymId: string | null | undefined = null;

    if (isServer) {
      const session = await getSession();
      token = session?.user.token;
      gymId = session?.user.gymId;
    } else {
      token = localStorage.getItem("x-auth-token");
      gymId = localStorage.getItem("gym-id");
      console.log("Gym Id is",gymId)
    }

    // Set auth token if available
    if (token) {
      request.headers["x-auth-token"] = token;
    }

    // Set gymId in headers for all requests
    if (gymId) {
      console.log("Gym Id is",gymId)
      request.headers["gym-id"] = gymId;
    } else {
      console.warn("No gymId found in session or localStorage");
    }

    return request;
  } catch (err) {
    console.error("[Axios Request Interceptor] Error:", err);
    return request;
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const resData = error.response?.data;

    if (resData && typeof resData === "string" && resData.includes("<!DOCTYPE html>")) {
      console.error("[Axios] Received HTML instead of JSON. Possibly hit frontend route.");
      return Promise.reject({ error: "Invalid API endpoint or baseURL misconfigured" });
    }

    // Handle unauthorized errors specifically
    if (error.response?.status === 401) {
      // You might want to redirect to login here
      console.error("Authentication failed - redirecting to login");
    }

    console.error("[Axios Error]", resData || error.message);
    return Promise.reject(resData || { error: error.message });
  }
);

export default axiosInstance;