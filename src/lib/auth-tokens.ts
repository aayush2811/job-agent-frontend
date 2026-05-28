const AUTH_STORAGE_KEY = 'auth-storage';
const ACCESS_KEY = 'auth_token';
const REFRESH_KEY = 'auth_refresh_token';

function readPersistedState(): { token?: string; refreshToken?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string; refreshToken?: string } };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

/** Single source of truth: mirrored localStorage keys */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const direct = localStorage.getItem(ACCESS_KEY);
  if (direct) return direct;
  return readPersistedState()?.token ?? null;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  const direct = localStorage.getItem(REFRESH_KEY);
  if (direct) return direct;
  return readPersistedState()?.refreshToken ?? null;
}

export function setAuthCookies(accessToken: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `auth_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function syncTokenStorage(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  setAuthCookies(accessToken);
}

export function clearTokenStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  clearAuthCookies();
}
