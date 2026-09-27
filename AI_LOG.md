# AI Usage Log — CodeRoom (JS2 Assignment)

This log documents AI assistance used during the development of this project,
per the course's AI Policy.

---

**Tool used:** Microsoft Copilot **Date:** 5 September 2026 – 22 September 2026
**Purpose:** Early planning and design feedback, brainstorming project
structure, which files/modules the project would need, and general design
direction before development began. Discussed pros and cons of trying to use
Netlify to deploy with a walkthrough of setup in VSCode and, GitHub and Netlify.
**Outcome:** Used to help shape the initial project plan and file structure.
Switched to a different AI tool (Claude) on 22 September 2026 due to reliability
issues where Copilot would make confident-sounding assumptions rather than
acknowledging uncertainty, and had inconsistent memory of earlier parts of the
conversation, which made ongoing debugging sessions unreliable. Deleted the
account and its stored history after switching, so I have no detailed log.

---

**Tool used:** Claude (Anthropic) **Date:** 22 September 2026 – 27 September
2026

Used across several sessions for debugging, code review, and clarifying
assignment requirements. Summary of what it was used for:

- **Create-post modal not opening.** Found two causes: missing CSS for the
  modal, and a DOM-timing bug where the click listener attached before the
  navbar existed. Fixed with `modal.css` and event delegation.
- **CSS file organization.** Guidance on which CSS file new styles belonged in
  (modals vs. post cards vs. page-specific), to keep the project modular.
- **Netlify → GitHub Pages migration.** Fixed absolute icon/fetch paths that
  broke under GitHub Pages' subpath hosting, disabled GitHub's default Jekyll
  processing with a `.nojekyll` file, and added missing `response.ok` checks to
  prevent GitHub's 404 page from being injected into the app.
- **Profile page bugs.** Fixed the post title showing "Post" instead of the
  author's name (profile page used a separate, inconsistent post-renderer from
  the main feed), and redesigned the avatar-editing UI to be more intuitive
  (hidden input/save button revealed via an edit icon).
- **Logout button not working.** Found a class name mismatch (`.logout-btn` in
  the JS vs. `.btn-logout` in the HTML). Fixed, documented, and closed as a bug
  in GitHub Issues.
- **Duplicate comment/edit fields.** Added a toggle check so clicking the
  comment or edit icon again closes the existing field instead of stacking a new
  one.
- **Mobile layout issues.** Traced narrow post cards to doubled padding across
  `body`/`.posts`/`.filter-container`, and traced excess spacing above the
  header to a leftover duplicate CSS rule in `auth.css` overriding `global.css`
  — removed the unused file.
- **Dead code cleanup.** Removed an unused placeholder file (`filter.js`), a
  mislabeled leftover `console.log`, and an inconsistent import path extension.
- **Clarifying requirements.** Confirmed emoji reactions and comment replies are
  pair-only requirements, not required solo. Kept the existing like button and
  added "Coming soon" labels for notifications and profile editing instead of
  building out-of-scope features.

**Outcome:** All code was written, reviewed, and tested by me. All actual
changes to files and their content was one by me. AI assistance was used for
debugging, explaining errors, and discussing structural decisions — not for
generating unexplained code. I can explain every part of this submission
line-by-line if asked.
