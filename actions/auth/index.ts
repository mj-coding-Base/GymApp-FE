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

    const res = await axios.post("/admin/trainer-management/login", {
      email: data.email,
      password: data.password,
      // rememberMe: true,
    }); 


    return res.data;
  } catch (error) {
    return error as SignInResponseDataType;
  }
};

// TODO-
// export const refreshToken = async (
//   refreshToken: string
// ): Promise<SignInResponseDataType> => {
//   try {
//     const res = await axios.post(
//       "/api/v1/admin/user-management/members/refresh-token",
//       { refreshToken }
//     );

//     return res.data;
//   } catch (error) {
//     return error as SignInResponseDataType;
//   }
// };

// export const updateProfileImage = async (
//   data: FormData
// ): Promise<CommonResponseDataType> => {
//   try {
//     const imageRes = await uploadImage(data);

//     if (imageRes.status === "FAIL") {
//       return imageRes;
//     }

//     const res = await axios.patch(`/api/admin/upload-profile-picture`, {
//       imageUrl: imageRes.data[0],
//     });

//     await updateProfilePictureInSession(imageRes.data[0]);

//     return res.data;
//   } catch (error) {
//     console.error(error);

//     return {
//       status: "FAIL",
//       message:
//         (error as any)?.message ??
//         "Something went wrong. Please try again later.",
//       data: null,
//     };q
//   }
// };

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