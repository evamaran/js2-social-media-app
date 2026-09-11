import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initPosts } from "./posts.ts";
import { initProfile } from "./profile.ts";
import { initLogin } from "./login.ts";
import { initRegister } from "./register.ts";
import { initLogout } from "./auth.ts";

// Get current page filename
function getPage() {
  return window.location.pathname.split("/").pop()?.toLowerCase() || "index.html";
}

// Block access to protected pages if user is not logged in
function requireAuth() {
  const page = getPage();

  // Public pages do not require auth
  if (page === "login.html" || page === "register.html") return;

  // Redirect if no token found
  if (!localStorage.getItem("token")) window.location.href = "login.html";
}

// Run auth check before anything else
requireAuth();

// Initialize correct components based on current page
export function initComponents() {
  const page = getPage();

  // Public pages
  if (page === "login.html") return initLogin();
  if (page === "register.html") return initRegister();

  // Shared UI for authenticated pages
  loadHeader();
  initNavbar();
  initFilter();

  // Page-specific logic
  if (page === "index.html") setTimeout(initPosts, 50); // Delay to ensure DOM is ready
  if (page === "profile.html") initProfile();

  // Logout button always available when logged in
  initLogout();
}

// Auto-run on page load
initComponents();
