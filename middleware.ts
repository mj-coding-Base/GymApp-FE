import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/authentication";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sign-in|new-password|reset-password|create-icon).*)",
  ],
};
