/**
 * JWT Utility Functions
 * 
 * These functions decode JWT tokens to extract gymId and memberId.
 * This ensures we always use the values from the token (source of truth)
 * rather than relying on localStorage which could be manipulated.
 * 
 * Note: This only decodes the token without verification. 
 * Token verification is done on the backend.
 */

export interface JWTPayload {
  user_id: string;
  memberId?: string;
  gymId: string;
  user_type: string;
  iat: number;
  exp: number;
}

/**
 * Decodes a JWT token and extracts the payload
 * @param token - The JWT token string
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tokens are base64url encoded and have 3 parts: header.payload.signature
    // We only need to decode the payload (middle part) to get the data
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format: expected 3 parts, got', parts.length);
      return null;
    }

    // Decode the payload (second part)
    // Base64URL decoding: replace URL-safe characters and add padding if needed
    let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (payload.length % 4) {
      payload += '=';
    }
    
    const decoded = JSON.parse(atob(payload));
    
    // Debug logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Decoded JWT payload:', decoded);
    }
    
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extracts gymId from a JWT token
 * @param token - The JWT token string
 * @returns The gymId or null if not found
 */
export function getGymIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.gymId || null;
}

/**
 * Extracts memberId from a JWT token
 * @param token - The JWT token string
 * @returns The memberId or null if not found
 */
export function getMemberIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.memberId || null;
}

/**
 * Extracts user_id from a JWT token
 * @param token - The JWT token string
 * @returns The user_id or null if not found
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.user_id || null;
}

