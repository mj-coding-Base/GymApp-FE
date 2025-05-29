/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { SignJWT, jwtVerify } from "jose";

import { signIn } from "@/actions/auth";

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

const user = {
  id: res.data?._id,
  name: `${res.data?.firstName} ${res.data?.lastName}`,
  email: res.data?.email,
  token: res.data?.idToken, // assuming `idToken` is your JWT
};



// Then create encrypted session cookie as before...

// Then create encrypted session cookie as before...

  // Create the session
  const expires = res.data?.refreshToken
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    : new Date(Date.now() + 1000 * 60 * 60 * 8);

  const createdAt = new Date(Date.now());
  const session = await encrypt({ user, expires, createdAt });

  // Save the session in a cookie
  (await cookies()).set("session-boxfit-admin", session, { expires });

  return res;
}

export async function logout() {
  // Destroy the session
  (await cookies()).set("session-boxfit-admin", "", { expires: new Date(0) });
}

// Session type
export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    token: string;
    refreshToken: string | null;
  };
  expires: Date;
  createdAt: Date;
};

// Get the session
export async function getSession(): Promise<Session | null> {
  const sessionCookie = (await cookies()).get("session-boxfit-admin")?.value;

  if (!sessionCookie) return null;

  const decrypted = await decrypt(sessionCookie);

  return decrypted;
}

// Update the session
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session-boxfit-admin")?.value;

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

  (await cookies()).set("session-boxfit-admin", newSession, { expires });

  console.log("Access token updated");

  return session;
};