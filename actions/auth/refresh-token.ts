"use server";

import axiosInstance from "@/utils/axios";

export interface RefreshTokenResponse {
  status: "SUCCESS" | "FAIL";
  message: string;
  data?: {
    idToken: string;
    refreshToken?: string;
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      "/admin/admin-management/refresh-token",
      { refreshToken }
    );

    return response.data;
  } catch (error: any) {
    console.error("Token refresh failed:", error);
    return {
      status: "FAIL",
      message: error?.response?.data?.message || error?.message || "Token refresh failed",
    };
  }
}
