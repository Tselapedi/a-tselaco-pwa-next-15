import { http } from './http';

interface RegisterFormData {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Token management
const TOKEN_KEY = 'auth_token';

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete http.defaults.headers.common['Authorization'];
};

// Authentication endpoints
export async function login(email: string, password: string) {
  const response = await http.post<AuthResponse>('/login', { email, password });
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
}

export async function socialLogin(provider: string, data: any) {
  const response = await http.post<AuthResponse>('/social-login', { provider, ...data });
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
}

export async function register(formData: RegisterFormData) {
  const response = await http.post<AuthResponse>('/register', formData);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
}

export async function logout() {
  try {
    await http.post('/logout');
  } finally {
    removeToken();
  }
}

// Password reset flow
export async function sendResetEmail(email: string) {
  return http.post('/password/email', { email });
}

export async function verifyResetCode(code: string, email: string) {
  return http.post('/password/verify-code', { code, email });
}

export async function resetPassword(email: string, password: string, code: string) {
  return http.post('/password/reset', { email, password, code });
}

// Token verification
export async function checkToken(token: string) {
  try {
    const response = await http.post('/check-token', { token });
    return response.data;
  } catch (error) {
    removeToken();
    throw error;
  }
}

// Initialize token from storage
if (typeof window !== 'undefined') {
  const token = getToken();
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}