import { registerUser } from "./api/auth.js";

export function initRegister() {
  const form = document.querySelector("#registerForm") as HTMLFormElement;
  const message = document.querySelector(".auth-message") as HTMLParagraphElement | null;

  // Run only on register.html
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

  const nameInput = document.getElementById("name") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();


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