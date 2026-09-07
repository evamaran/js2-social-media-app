console.log("🔥 components.js is running");

import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initAuth } from "./auth.ts";
import { initPosts } from "./posts.ts";
import { initProfile } from "./profile.ts";
import { initLogin } from "./login.ts";
import { initRegister } from "./register.ts";
import { initFeed } from "./feed.ts";

/**
 * Initialize all shared UI components across the site.
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