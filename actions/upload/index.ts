"use server";

import axios from "@/utils/axios";
import axiosRaw from "axios"; // Only for CancelToken

import { getSession } from "@/lib/authentication";
import type { CommonResponseDataType } from "@/types/Common";

export const uploadImage = async (
  data: FormData,
  onUploadProgress?: (progressEvent: any) => void,
  cancelTokenSourceRef?: React.MutableRefObject<any>
): Promise<CommonResponseDataType> => {
  try {
    const session = await getSession();

    if (cancelTokenSourceRef) {
      cancelTokenSourceRef.current = axiosRaw.CancelToken.source();
    }

    // Use configured axios instance (goes through interceptor)
    // The interceptor will automatically add x-auth-token header from session
    // But since this is server-side, we need to ensure session is available
    const res = await axios.post(
      `/file-upload`,
      data,
      {
        onUploadProgress,
        cancelToken: cancelTokenSourceRef
          ? cancelTokenSourceRef.current.token
          : undefined,
        // Note: x-auth-token header is automatically set by axios interceptor
        // But for server-side requests, we ensure it's set if session exists
        headers: session?.user.token ? {
          "x-auth-token": `${session.user.token}`,
        } : undefined,
      }
    );

    return res.data;
  } catch (error) {
    console.log(error);

    return {
      status: "FAIL",
      message:
        (error as CommonResponseDataType)?.message ?? "Something went wrong!",
      data: null,
    };
  }
};
