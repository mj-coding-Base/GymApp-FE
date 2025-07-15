import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const backendUrl = "http://129.154.47.11:8080/api/v1";

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
  } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status || 500;
      const data = (error as { response?: { data?: unknown } })?.response?.data || { error: "Internal Server Error" };
      res.status(status).json(data);

  }
};

export default handler;