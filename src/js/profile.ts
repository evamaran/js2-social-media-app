import { getUser } from './utils/storage.js';

export function initProfile() {
  const user = getUser();
  if (!user) return;

  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  const logoutBtn = document.querySelector('.logout-btn');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
}
