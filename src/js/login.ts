import { loginUser } from './api/auth.ts';
import { saveUser } from './utils/storage.js';

export function initLogin() {
  // Get login form and message element
  const form = document.querySelector('#loginForm') as HTMLFormElement;
  const message = document.querySelector(
    '.auth-message'
  ) as HTMLParagraphElement | null;

  // Stop if form is not found
  if (!form) return;

  // Handle login form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    // Read user input values
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      // Send login request to API
      const data = await loginUser({ email, password });

      // Save token and user info to localStorage
      localStorage.setItem('token', data.accessToken);
      saveUser({ name: data.name, email: data.email });

      // Redirect to main page after successful login
      window.location.href = 'index.html';
    } catch (error) {
      // Show error message if login fails
      const err = error as Error;
      if (message) message.textContent = err.message;
      else alert(err.message);
    }
  });
}
