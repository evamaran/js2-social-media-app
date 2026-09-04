export function saveUser(user: {
  accessToken: string;
  name: string;
  email: string;
}) {
  localStorage.setItem("token", user.accessToken);
  localStorage.setItem("name", user.name);
  localStorage.setItem("email", user.email);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  return {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    token: localStorage.getItem("token"),
  };
}

export function clearUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
}