// types/auth.ts
export interface UserSession {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string | null;
  mobile?: string;
  // role?: 'admin' | 'trainer';
  // profilePicture?: string;
}

export interface Session {
  user: UserSession;
  expires: Date;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  status: 'SUCCESS' | 'FAIL';
  message?: string;
  data?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    idToken: string;
    refreshToken?: string;
    // profilePicture?: string;
    // adminType?: string;
  };
}
