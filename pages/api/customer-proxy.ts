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
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Internal Server Error" };
    res.status(status).json(data);
  }
};

export default handler;