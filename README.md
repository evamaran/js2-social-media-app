# CodeRoom — JS2 Social Media App

## Overview

CodeRoom is a social media frontend I built for the Noroff FED JavaScript 2
course. Users can register, log in, create posts, browse a feed, view profiles,
and interact with content through the Noroff Social API.

## Assignment Context

This project follows the official JS2 Social Media API assignment. The core
requirements were:

- User registration and login
- Token-based authentication
- Creating, editing, and deleting posts
- Viewing profiles and user-specific content
- Filtering and sorting posts
- Modular JavaScript architecture
- Fetch API with async/await
- A working production build, deployed

## Improvements & Fixes

Along the way, I ran into a few problems and worked through them:

- Authentication flow: Fixed a redirect loop, corrected how tokens were handled,
  and improved the auth-guard logic.
- Module structure: Cleaned up imports, reorganized utility files, and solved
  some Vite build issues.
- UI components: Split the header, navbar, filters, and post rendering into
  separate, reusable modules.
- Feed stability: Improved the filtering logic, rendering performance, and how
  errors from the API are handled.
- Production reliability: Made sure the app behaves the same way in development
  as it does in the production build.

## Live Demo

https://coderoomjs2.netlify.app/

## Repository

https://github.com/evamaran/js2-social-media-app

## Testing

- API endpoints tested with valid tokens
- Build validated with Vite
- Responsive layout tested on mobile (Android)
- HTML/CSS validated, no critical issues found
- Authentication tested across login, logout, and protected routes

## Installation

```
npm install
npm run dev
npm run build
```

## Tech Stack

- JavaScript (ES Modules)
- TypeScript (in selected modules)
- Vite
- Noroff Social API v2
- Netlify

## Author

Eva, Frontend Development student at Noroff, 2026.
