
# Resume.Builder — Static Starter (GitHub Pages Ready)

This package contains a **no-build** static website you can upload directly to GitHub and run on GitHub Pages.

## Pages
- `index.html` — Landing
- `ats.html` — ATS Score Checker (paste text or upload DOCX/TXT)
- `builder.html` — Resume Builder (2 templates, live preview, PDF download)
- `pricing.html`, `privacy.html`, `terms.html`

## Features
- Google Login (Firebase) — Buttons in the navbar
- ATS scoring — client-side, transparent rubric
- Auto-fill builder via localStorage (from ATS page)
- Save locally (no server). Firestore can be plugged in later.

## How to Deploy to GitHub Pages
1. Create a new GitHub repository named `resume-builder` (or use your existing one).
2. **Upload all files** from this ZIP at the repo root (Drag & drop using the GitHub web UI).
3. Go to **Settings ▸ Pages ▸ Build and deployment** and set:
   - Source: `Deploy from a branch`
   - Branch: `main` and folder `/ (root)`
4. Wait ~1 minute → your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

## Firebase Setup
Your Firebase config is already included in `js/firebase.js`. Ensure you added:
- Authorized domains: `github.io` and `<your-username>.github.io`
- Sign-in method: Google = Enabled

> Note: This starter saves data in localStorage. Firestore integration can be added later.

## Replace Logo
Put your logo at `assets/logo.png` (a sample is included).

## Credits
Designed for Rahul Satav's Resume.Builder project.
