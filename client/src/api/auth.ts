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
  };
};

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
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
  const response = await axios.post<AuthResponse>(
    `${API_BASE}/login`,
    data,
    {
      withCredentials: true,
    },
  );
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

