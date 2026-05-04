/**
 * authFetch — a drop-in fetch wrapper that:
 *  1. Attaches the stored Bearer access token to every request
 *  2. On 401, calls the refresh endpoint (using the HttpOnly cookie)
 *  3. Stores the new access token and retries the request once
 *  4. If refresh also fails, clears tokens and redirects to /login
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/token/refresh-cookie/`, {
      method: 'POST',
      credentials: 'include', // sends the HttpOnly refresh cookie
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
    }
  } catch (e) {
    console.error('Token refresh failed:', e);
  }
  return null;
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');

  const makeRequest = (accessToken: string | null) =>
    fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await makeRequest(token);

  // If 401, try to refresh and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      // Refresh failed → clear everything and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return res;
}

/**
 * authFetchForm — same as authFetch but does NOT set Content-Type header
 * (required when sending FormData/multipart)
 */
export async function authFetchForm(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');

  const makeRequest = (accessToken: string | null) =>
    fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return res;
}
