"use server";

// import { updateProfilePictureInSession } from "@/lib/authentication";

import type { CommonResponseDataType } from "@/types/Common";
import axios from "@/utils/axios";

type SignInDataType = {
  email: string;
  password: string;
  // rememberMe: boolean;
};

type SignInResponseDataType = {
  status: "SUCCESS" | "FAIL";
  message: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    idToken: string;
    refreshToken: string;
  } | null;
};

export const signIn = async (
  data: SignInDataType
): Promise<SignInResponseDataType> => {
  try {

    const res = await axios.post("/admin/admin-management/login", {
      email: data.email,
      password: data.password,
      rememberMe: true,
    }); 


    return res.data;
  } catch (error) {
    return error as SignInResponseDataType;
  }
};


export const forgotPassword = async (
  email: string
): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.post(
      "https://bixfit-backend-dev-407792198674.asia-southeast1.run.app/api/v1/admin/admin-management/forgot-password",
      { email }
    );

    return res.data;
  } catch (error) {
    return error as CommonResponseDataType;
  }
};

export const resetPassword = async ({
  newPassword,
  token,
}: {
  newPassword: string;
  token: string;
}): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      "https://bixfit-backend-dev-407792198674.asia-southeast1.run.app/api/v1/admin/admin-management/change-password",
      {
        password: newPassword,
        confirmPassword: newPassword,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    return res.data;
  } catch (error) {
    return error as CommonResponseDataType;
  }
};

export const changePassword = async ({
  oldPassword,
  newPassword,
  confirmPassword,
}: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<CommonResponseDataType> => {
  try {
    const res = await axios.patch(
      "/api/v1/admin/admin-management/reset-password",
      {
        oldPassword,
        newPassword,
        confirmPassword,
      }
    );

    return res.data;
  } catch (error) {
    return error as CommonResponseDataType;
  }
};