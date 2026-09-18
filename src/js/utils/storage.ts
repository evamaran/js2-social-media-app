export function saveUser(user: {
  name: string;
  email: string;
  accessToken: string;
  username?: string;
  avatar?: string;
}) {
  const storedUser = {
    name: user.name,
    email: user.email,
    accessToken: user.accessToken,
    username: user.username || user.name, // fallback
    avatar: user.avatar || null,
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
