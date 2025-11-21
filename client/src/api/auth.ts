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
  user: UserProfile;
  accessToken?: string;
};

export type UserProfile = {
  email: string;
  id: string;
  plan: 'free' | 'pro';
};

export type ResetPasswordResponse = {
  message: string;
  user?: UserProfile;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  passwordConfirm: string;
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

export async function getCurrentUser(): Promise<AuthResponse | null> {
  try {
    const response = await axios.get<{ user: UserProfile | null }>(
      `${API_BASE}/me`,
      {
        withCredentials: true,
      },
    );

    // Server returns { user: null } if not authenticated (no error thrown)
    if (!response.data.user) {
      return null;
    }

    return { user: response.data.user };
  } catch (error) {
    // Only log unexpected server errors (5xx)
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && status >= 500) {
        console.error('Server error checking auth:', status);
      }
    }
    return null;
  }
}
