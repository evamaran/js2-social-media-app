import { registerUser } from "./api/auth.js";

export function initRegister() {
  const form = document.querySelector("#registerForm") as HTMLFormElement;
  const message = document.querySelector(".auth-message") as HTMLParagraphElement | null;

  // Kjør kun på register.html
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      await registerUser({ name, email, password });

      if (message) {
        message.textContent = "Registration successful! Redirecting...";
      }

      window.location.href = "login.html";
    } catch (error) {
      if (message) {
        message.textContent = (error as Error).message;
      } else {
        alert((error as Error).message);
      }
    }
  });
}