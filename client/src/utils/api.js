const TOKEN_KEY = 'ivt_token';
const NAME_KEY = 'ivt_name';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, name) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(NAME_KEY, name);
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(NAME_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(NAME_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAuth();
    window.location.reload();
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
