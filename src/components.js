import { loadHeader } from "./header.js";
import { initNavbar } from "./navbar.js";
import { initFilter } from "./filter.js";
import { initAuth } from "./auth.js";
import { initPosts } from "./posts.js";

export function initComponents() {
  loadHeader();
  initNavbar();
  initFilter();
  initAuth();
  initPosts();
}

initComponents();