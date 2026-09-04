import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";
import { initProfile } from "./profile.js";
import { initLogin } from "./login.js";
import { initRegister } from "./register.js";
import { initFeed } from "./feed.js";

/**
 * Initialize all shared UI components across the site.
 * Add new imports here as you create more JS files.
 */
export function initComponents() {
  loadHeader();     // Header first
  initNavbar();     // Navbar second
  initFilter();     // Filter chips
  initAuth();       // Auth BEFORE posts
  initPosts();      // Posts AFTER auth
  initProfile();    // Profile page logic
  initLogin();      // Login page logic
  initRegister();   // Register page logic
  initFeed();       // Feed page logic
}

// Run automatically when the file loads
initComponents();