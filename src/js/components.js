import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initPosts } from "./posts.ts";
import { initProfile } from "./profile.ts";
import { initLogin } from "./login.ts";
import { initRegister } from "./register.ts";
import { initLogout } from "./logout.ts";
import { initPost } from "./post.ts";
import { getToken } from "./utils/storage.ts";

// Determine which page is currently loaded.
function getPage() {
	const path = window.location.pathname.toLowerCase();

	if (path.includes("login")) return "login.html";
	if (path.includes("register")) return "register.html";
	if (path.includes("profile")) return "profile.html";
	if (path.includes("post.html")) return "post.html";
	return "index.html";
}

// Redirect users away from protected pages if no token is present.
function requireAuth() {
	const page = getPage();

	if (page === "login.html" || page === "register.html") return;

	if (!getToken()) {
		window.location.href = "login.html";
	}
}

// Initialize page-specific logic and shared UI components.
export async function initComponents() {
	const page = getPage();

	// Public pages
	if (page === "login.html") return initLogin();
	if (page === "register.html") return initRegister();

	// Protected pages
	requireAuth();

	// Shared UI
	loadHeader();
	await initNavbar();
	initFilter();

	// Page-specific logic
	if (page === "index.html") await initPosts();
	if (page === "profile.html") initProfile();
	if (page === "post.html") await initPost();

	initLogout();
}

// Run automatically
initComponents();
