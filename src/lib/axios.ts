import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Endpoints that should NEVER trigger a token refresh attempt
const NO_REFRESH_URLS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/me'];

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url ?? '';

    const isAuthEndpoint = NO_REFRESH_URLS.some((url) =>
      requestUrl.includes(url)
    );
    const alreadyOnAuthPage =
      window.location.pathname === '/login' ||
      window.location.pathname === '/register';

    // Only attempt token refresh for protected API calls that fail with 401,
    // not for auth endpoints themselves or when already on login/register.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !alreadyOnAuthPage
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        // Retry the original request with the new access token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh also failed — force logout only if not already there
        if (!alreadyOnAuthPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
