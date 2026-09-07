export function initLogin() {}

import { loginUser } from "./api/auth.js";
import { saveUser } from "./utils/storage.js";

const form = document.querySelector("#loginForm") as HTMLFormElement;
const message = document.querySelector(".auth-message") as HTMLParagraphElement | null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  try {
    const user = await loginUser({ email, password });

    saveUser(user);

    window.location.href = "profile.html";
  } catch (error) {
    if (message) {
      message.textContent = (error as Error).message;
    } else {
      alert((error as Error).message);
    }
  }
});