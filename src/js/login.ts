import { loginUser } from './api/auth.js';
import { saveUser } from './utils/storage.js';
// @ts-ignore
import { createApiKey } from './api/createApiKey.js';

export function initLogin() {
  const form = document.querySelector('#loginForm');

  // Stop running on pages without login form
  if (!form) return;

  const message = document.querySelector('.auth-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = (
      document.getElementById('email') as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById('password') as HTMLInputElement
    ).value.trim();

    try {
      const data = await loginUser({ email, password });

      saveUser({
        name: data.name,
        email: data.email,
        accessToken: data.accessToken,
      });

      // ⭐ API key skal IKKE stoppe login hvis den feiler
      try {
        await createApiKey();
      } catch (apiErr) {
        console.error('API key generation failed:', apiErr);
      }

      if (message) {
        message.textContent = 'Login successful! Redirecting...';
      }

      window.location.href = 'index.html';
    } catch (error) {
      const err = error as Error;

      if (message) {
        message.textContent = err.message;
      } else {
        alert(err.message);
      }
    }
  });
}
