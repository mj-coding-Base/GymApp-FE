import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIP } from "../../utils/rateLimiter";

// 🔒 SECURITY: Use environment variable for backend URL, never hardcode IPs
const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.payzhe.fit/api/v1";

// 🔒 SECURITY: Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per IP
};

// 🔒 SECURITY: Only allow POST method to prevent unauthorized access
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔒 SECURITY: Rate limiting
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT);
  
  if (!rateLimitResult.allowed) {
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    return res.status(429).json({ 
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  // 🔒 SECURITY: Validate that auth token exists
  const authToken = req.headers["x-auth-token"];
  if (!authToken || typeof authToken !== "string") {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  // 🔒 SECURITY: Validate request body exists and is an object
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Bad request: Invalid request body" });
  }

  // 🔒 SECURITY: Validate request body size (prevent DoS)
  const bodySize = JSON.stringify(req.body).length;
  const MAX_BODY_SIZE = 1024 * 1024; // 1MB
  if (bodySize > MAX_BODY_SIZE) {
    return res.status(413).json({ error: "Request body too large" });
  }

  try {
    const apiRes = await axios.post(
      `${backendUrl}/admin/customer-management/individual`,
      req.body,
      {
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json",
        },
        // 🔒 SECURITY: Set timeout to prevent hanging requests
        timeout: 10000, // 10 seconds
        // 🔒 SECURITY: Limit response size to prevent memory exhaustion
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
      }
    );

    res.status(apiRes.status).json(apiRes.data);
  } catch (error: unknown) {
    // 🔒 SECURITY: Don't expose internal error details
    const status = (error as { response?: { status?: number } })?.response?.status || 500;
    const data = (error as { response?: { data?: unknown } })?.response?.data || { error: "Internal Server Error" };
    res.status(status).json(data);
  }
};

export default handler;