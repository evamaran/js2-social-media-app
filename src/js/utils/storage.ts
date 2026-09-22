export function saveUser(user: any) {
  const token =
    user.accessToken ||
    user.token ||
    user.data?.accessToken ||
    user.data?.token;

  const storedUser = {
    name: user.name || user.data?.name,
    email: user.email || user.data?.email,
    accessToken: token,
    username: user.username || user.name || user.data?.name,
    avatar: user.avatar || user.data?.avatar || null,
  };

  localStorage.setItem('user', JSON.stringify(storedUser));
}

export function getUser() {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  const parsed = JSON.parse(stored);

  // Auto-restore username if missing
  if (!parsed.username && parsed.name) {
    parsed.username = parsed.name;
    localStorage.setItem('user', JSON.stringify(parsed));
  }

  return parsed;
}

export function clearUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('apiKey');
}

export function saveApiKey(key: string) {
  localStorage.setItem('apiKey', key);
}

export function getApiKey() {
  return localStorage.getItem('apiKey');
}

export function getToken() {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  const parsed = JSON.parse(stored);
  return parsed.accessToken || null;
}
