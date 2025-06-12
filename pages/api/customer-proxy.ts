import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const backendUrl = "https://dev-bixfit-backend-new-407792198674.asia-southeast1.run.app/api/v1";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const apiRes = await axios.post(
      `${backendUrl}/admin/customer-management/individual`,
      req.body,
      {
        headers: {
          "x-auth-token": req.headers["x-auth-token"] || "",
          "Content-Type": "application/json",
        },
      }
    );

    res.status(apiRes.status).json(apiRes.data);
  } catch (error) {
    let status = 500;
    let data = { error: "Internal Server Error" };
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { status?: number; data?: string } };
      status = err.response?.status ?? 500;
      const respData = err.response?.data;
      data = typeof respData === "string"
        ? { error: respData }
        : respData ?? { error: "Internal Server Error" };
    }
    res.status(status).json(data);
  }
};

export default handler;