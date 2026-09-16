import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initPosts } from "./posts.ts";
import { initProfile } from "./profile.ts";
import { initLogin } from "./login.ts";
import { initRegister } from "./register.ts";
import { initLogout } from "./logout.ts";

/**
 * Get the current page filename (e.g. "index.html")
 */
function getPage() {
	return window.location.pathname.split("/").pop()?.toLowerCase() || "index.html";
}

/**
 * Protect authenticated pages by redirecting users without a token.
 * Public pages (login/register) are always allowed.
 */
function requireAuth() {
	const page = getPage();

	// Public pages do not require authentication
	if (page === "login.html" || page === "register.html") return;

	// Redirect if no token found
	if (!localStorage.getItem("token")) {
		console.warn("No token found — redirecting to login.");
		window.location.href = "login.html";
	}
}

/**
 * Initialize correct components based on the current page.
 * Public pages run their own logic first.
 * Auth-protected pages run requireAuth() before loading UI.
 */
export function initComponents() {
	const page = getPage();

	// PUBLIC PAGES — must run BEFORE requireAuth()
	if (page === "login.html") return initLogin();
	if (page === "register.html") return initRegister();

	// AUTH-PROTECTED PAGES
	requireAuth();

	// Shared UI for authenticated pages
	loadHeader();
	initNavbar();
	initFilter();

	// Page-specific logic
	if (page === "index.html") setTimeout(initPosts, 50); // Ensure DOM is ready
	if (page === "profile.html") initProfile();

	// Logout button always available when logged in
	initLogout();
}

// Auto-run on page load
initComponents();
