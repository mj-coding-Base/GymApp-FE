import axios, { AxiosError } from "axios";
import { getSession } from "@/lib/authentication";

const isServer = typeof window === "undefined";

// IMPORTANT: Ensure this is set in `.env.local`
// e.g., BASE_URL=http://localhost:3000/api
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(async (request) => {
  try {
    let token: string | null | undefined = null;

    if (isServer) {
      const session = await getSession();
      token = session?.user.token;
    } else {
      token = localStorage.getItem("x-auth-token");
    }

    if (token) {
      request.headers["x-auth-token"] = token;
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

    console.error("[Axios Error]", resData || error.message);
    return Promise.reject(resData || { error: error.message });
  }
);

export default axiosInstance;