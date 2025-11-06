/**
 * JWT Token Decoder Utility
 * 
 * Decodes JWT tokens to extract payload information without verification.
 * This is safe for client-side use since tokens are already verified by the backend.
 */

export interface JWTPayload {
  user_id: string;
  user_type: string;
  gymId?: string;
  memberId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Decodes a JWT token and returns its payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if decoding fails
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    // Replace URL-safe characters and add padding if needed
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode and parse JSON
    const decoded = JSON.parse(atob(base64));
    
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Extracts gymId from a JWT token
 * @param token - The JWT token
 * @returns The gymId if present, null otherwise
 */
export function getGymIdFromToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const payload = decodeJWT(token);
  return payload?.gymId || null;
}

/**
 * Extracts memberId from a JWT token
 * @param token - The JWT token
 * @returns The memberId if present, null otherwise
 */
export function getMemberIdFromToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const payload = decodeJWT(token);
  return payload?.memberId || null;
}
