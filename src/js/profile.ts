import { getUser } from "./utils/storage.js";

export function initProfile() {
  const user = getUser();
  if (!user) return; // If not logged in
  
  const nameEl = document.querySelector(".profile-name");
  const emailEl = document.querySelector(".profile-email");

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
}