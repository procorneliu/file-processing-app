import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth';

// Configure axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;

export type RegisterRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: {
    email: string;
    id: string;
    plan: 'free' | 'pro';
  };
};

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE}/register`,
    data,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${API_BASE}/login`, data, {
    withCredentials: true,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  await axios.post(
    `${API_BASE}/logout`,
    {},
    {
      withCredentials: true,
    },
  );
}

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  passwordConfirm: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
  user?: {
    email: string;
    id: string;
    plan: 'free' | 'pro';
  };
};

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await axios.post<ForgotPasswordResponse>(
    `${API_BASE}/forgot-password`,
    data,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await axios.post<ResetPasswordResponse>(
    `${API_BASE}/reset-password`,
    data,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export type UserProfile = {
  email: string;
  id: string;
  plan: 'free' | 'pro';
};

export type UserProfileResponse = {
  user: UserProfile;
};

export async function getCurrentUser(): Promise<UserProfileResponse> {
  const response = await axios.get<UserProfileResponse>(`${API_BASE}/me`, {
    withCredentials: true,
  });
  return response.data;
}
