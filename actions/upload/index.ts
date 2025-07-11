"use server";

import axios from "axios";

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
      cancelTokenSourceRef.current = axios.CancelToken.source();
    }

    const res = await axios.post(
      `/file-upload`,
      data,
      {
        onUploadProgress,
        cancelToken: cancelTokenSourceRef
          ? cancelTokenSourceRef.current.token
          : undefined,
        headers: {
          "x-auth-token": `${session?.user.token}`,
        },
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
