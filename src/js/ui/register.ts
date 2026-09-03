import { registerUser } from "../api/auth.js";

const form = document.querySelector("#registerForm") as HTMLFormElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = (event.target as HTMLFormElement).name.value.trim();
  const email = (event.target as HTMLFormElement).email.value.trim();
  const password = (event.target as HTMLFormElement).password.value.trim();

  try {
    await registerUser({ name, email, password });
    window.location.href = "login.html";
  } catch (error) {
    alert((error as Error).message);
  }
});
