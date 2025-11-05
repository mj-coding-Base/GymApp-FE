/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { SignJWT, jwtVerify } from "jose";

import { signIn } from "@/actions/auth";
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
  // const UserDetails = res.data;
  // console.log(UserDetails)
  // Check if the response is undefined

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

  // CRITICAL SECURITY: Extract gymId and memberId from JWT token
  // This ensures we use values from the token (source of truth) rather than
  // relying on API response which could be manipulated
  const tokenGymId = res.data?.idToken ? getGymIdFromToken(res.data.idToken) : null;
  const tokenMemberId = res.data?.idToken ? getMemberIdFromToken(res.data.idToken) : null;

  // Debug logging
  console.log('Token gymId:', tokenGymId);
  console.log('Token memberId:', tokenMemberId);
  console.log('API response gymId:', res.data?.gymId);
  console.log('API response memberId:', res.data?.memberId);

  // Use gymId from token if available, otherwise fallback to API response
  // This provides backward compatibility while prioritizing security
  const finalGymId = tokenGymId || res.data?.gymId || null;
  const finalMemberId = tokenMemberId || res.data?.memberId || null;

  console.log('Final gymId:', finalGymId);
  console.log('Final memberId:', finalMemberId);

  if (!finalGymId) {
    console.error("Could not extract gymId from token or API response");
    return {
      status: "FAIL",
      message: "Authentication failed: Missing gymId in token",
    };
  }

  const user = {
    id: res.data?._id,
    memberId: finalMemberId,
    name: res.data?.firstName && res.data?.lastName
      ? `${res.data.firstName} ${res.data.lastName}`
      : res.data?.email ?? "Unnamed User",
    email: res.data?.email,
    token: res.data?.idToken,
    refreshToken: res.data?.refreshToken,
    // -TODO
    isAdmin: res.data?.isAdmin,
    isFullTime: res.data?.isFullTime,
    gymId: finalGymId, // Always use gymId from token for security
    mobile: res.data?.mobile,
    // profilePicture: res.data?.profilePicture,
  };

  // Create the session
  const expires = res.data?.refreshToken
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    : new Date(Date.now() + 1000 * 60 * 60 * 8);

  const createdAt = new Date(Date.now());
  const session = await encrypt({ user, expires, createdAt });

  console.log('Setting user-details cookie with:', user); // Add this line

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


  // Save the session in a cookie

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
  const cookieStore = await cookies(); // First await the cookies()
  const sessionCookie = cookieStore.get("session-gymapp-admin")?.value; // Then access the value

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

// TODO-
// Check if the user is authenticated and update the profile picture
// export async function updateProfilePictureInSession(profilePicture: string) {
//   const session = await getSession();

//   if (!session) {
//     return null;
//   }

//   session.user.profilePicture = profilePicture;

//   const expires = new Date(session.expires);
//   const newSession = await encrypt(session);

//   (await cookies()).set("session-boxfit-admin", newSession, { expires });

//   return session;
// }

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