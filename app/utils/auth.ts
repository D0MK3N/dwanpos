// Get JWT token from cookie (auth_token) or localStorage
export function getAuthToken(): string | null {
  // Try cookie first
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}
// utils/auth.ts
// Helper untuk decode JWT dan cek expired

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
