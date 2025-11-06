/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { SignJWT, jwtVerify } from "jose";

import { signIn } from "@/actions/auth";
import { refreshAccessToken } from "@/actions/auth/refresh-token";
import { Session } from "@/types/auth";
import { getGymIdFromToken, getMemberIdFromToken } from "@/utils/jwt";

const secretKey = process.env.JWT_SECRET || "secret123";
const key = new TextEncoder().encode(secretKey);

// Encrypt and decrypt functions
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8 hours")
    .sign(key);
}

// Decrypt the token
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
      requiredClaims: ["iat", "exp"],
    });

    return payload;
  } catch {
    return null;
  }
}

// Login function
export async function login(data: {
  email: string;
  password: string;
  rememberMe: boolean;
}) {
  const res = await signIn(data);

  if (!res) {
    console.error("signIn returned undefined");
    return {
      status: "FAIL",
      message: "Internal error: no response from signIn()",
    };
  }

  if (res.status === "FAIL") {
    return res;
  }

  // Extract gymId and memberId from JWT token (more secure than trusting response data)
  const tokenGymId = getGymIdFromToken(res.data?.idToken);
  const tokenMemberId = getMemberIdFromToken(res.data?.idToken);

  // Use gymId from token, fallback to response data if token doesn't have it
  // This ensures we always use the gymId from the signed token
  const gymId = tokenGymId || res.data?.gymId || null;
  const memberId = tokenMemberId || res.data?.memberId || null;

  if (!gymId) {
    console.error("Missing gymId in token. This should not happen.");
    return {
      status: "FAIL",
      message: "Authentication failed: Missing gym association. Please contact administrator.",
    };
  }

  // Get refresh token from response or cookie
  let refreshTokenValue = res.data?.refreshToken;
  if (!refreshTokenValue && typeof window !== 'undefined') {
    refreshTokenValue = localStorage.getItem("refresh-token") || undefined;
  }

  const user = {
    id: res.data?._id,
    name: res.data?.firstName && res.data?.lastName
      ? `${res.data.firstName} ${res.data.lastName}`
      : res.data?.email ?? "Unnamed User",
    email: res.data?.email,
    token: res.data?.idToken,
    refreshToken: refreshTokenValue,
    isAdmin: res.data?.isAdmin,
    isFullTime: res.data?.isFullTime,
    gymId: gymId, // Use gymId from token
    memberId: memberId, // Use memberId from token
    mobile: res.data?.mobile,
  };

  // Store refresh token in localStorage for client-side access
  if (typeof window !== 'undefined' && refreshTokenValue) {
    localStorage.setItem("refresh-token", refreshTokenValue);
  }

  // Create the session
  const expires = res.data?.refreshToken
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    : new Date(Date.now() + 1000 * 60 * 60 * 8);

  const createdAt = new Date(Date.now());
  const session = await encrypt({ user, expires, createdAt });

  console.log('Setting user-details cookie with:', user);

  const cookieStore = await cookies();
  
  // Set session cookie (secure, HTTP-only)
  cookieStore.set("session-gymapp-admin", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  // Set client-readable cookie
  cookieStore.set("user-details", JSON.stringify(user), {
    expires,
    sameSite: "lax",
    path: "/",
  });

  // Update client state immediately
  if (typeof window !== 'undefined') {
    const { updateUserState } = await import('@/hooks/useUserDetails');
    updateUserState(user);
  }
  
  return res;
}

export async function logout() {
  // ⚡ PERFORMANCE: Fast logout - clear cookies only
  const cookieStore = await cookies();
  
  // Clear both cookies
  cookieStore.set("session-gymapp-admin", "", { 
    expires: new Date(0),
    path: "/",
    httpOnly: true,
  });
  
  cookieStore.set("user-details", "", {
    expires: new Date(0),
    path: "/",
  });
  
  // Clear localStorage on client side (done in the component)
  // This avoids any server-side operations that could slow down logout
}

// Get the session
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session-gymapp-admin")?.value;

  if (!sessionCookie) return null;

  try {
    const decrypted = await decrypt(sessionCookie);
    
    // Validate session expiration
    if (decrypted && new Date(decrypted.expires) > new Date()) {
      return decrypted;
    }
    return null;
  } catch (error) {
    console.error("Session decryption failed:", error);
    return null;
  }
}

// Update the session
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session-gymapp-admin")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const decrypted = await decrypt(session);

  if (!decrypted) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.next();

  return response;
}

// Update the access token
export const updateAccessTokenInSession = async (accessToken: string) => {
  const session = await getSession();

  if (!session || !accessToken) {
    return null;
  }

  session.user.token = accessToken;

  const expires = new Date(session.expires);
  const newSession = await encrypt(session);

  (await cookies()).set("session-gymapp-admin", newSession, { expires });

  return session;
};

/**
 * Refresh access token using refresh token
 * Implements automatic token refresh when access token expires
 */
export async function refreshToken(): Promise<{ success: boolean; token?: string }> {
  try {
    const cookieStore = await cookies();
    
    // Try to get refresh token from cookie or session
    let refreshToken: string | null = null;
    
    // Check session for refresh token
    const session = await getSession();
    if (session?.user?.refreshToken) {
      refreshToken = session.user.refreshToken;
    }
    
    // Also check cookie directly (for server-side refresh)
    if (!refreshToken) {
      refreshToken = cookieStore.get("refreshToken")?.value || null;
    }
    
    // Also check localStorage (for client-side)
    if (!refreshToken && typeof window !== 'undefined') {
      refreshToken = localStorage.getItem("refresh-token");
    }
    
    if (!refreshToken) {
      return { success: false };
    }

    const result = await refreshAccessToken(refreshToken);
    
    if (result.status === "SUCCESS" && result.data?.idToken) {
      // Update session with new access token
      if (session) {
        session.user.token = result.data.idToken;
        if (result.data.refreshToken) {
          session.user.refreshToken = result.data.refreshToken;
        }
        
        const expires = new Date(session.expires);
        const newSession = await encrypt(session);
        cookieStore.set("session-gymapp-admin", newSession, { expires });
        
        // Update user-details cookie if exists
        const userDetailsCookie = cookieStore.get("user-details")?.value;
        if (userDetailsCookie) {
          try {
            const userDetails = JSON.parse(userDetailsCookie);
            userDetails.token = result.data.idToken;
            if (result.data.refreshToken) {
              userDetails.refreshToken = result.data.refreshToken;
            }
            cookieStore.set("user-details", JSON.stringify(userDetails), {
              expires,
              sameSite: "lax",
              path: "/",
            });
          } catch {
            // Ignore parsing errors
          }
        }
      }
      
      // Also update localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem("x-auth-token", result.data.idToken);
        if (result.data.refreshToken) {
          localStorage.setItem("refresh-token", result.data.refreshToken);
        }
      }
      
      return { success: true, token: result.data.idToken };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false };
  }
}