import { clearUser } from "./utils/storage.js";

export function initLogout() {
  const btn = document.querySelector(".logout-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    clearUser();
    window.location.href = "login.html";
  });
}